import {
  collection, doc, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDocs, writeBatch, query, orderBy, where,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { db, auth, FAMILY_LOGIN_EMAIL } from './firebase-init.js';

(function () {
  const ALL_TAB = '__all__';
  const FRIDGE_ID = 'fridge';

  const DEFAULT_CATEGORIES = [
    { id: FRIDGE_ID, name: '냉장고' },
    { id: 'supplement', name: '영양제' },
    { id: 'medicine', name: '의약품' },
    { id: 'cabinet', name: '수납장' },
  ];

  // 양문형 냉장고: 좌/우 각각 본체 6칸 + 날개(도어포켓) 5칸
  const FRIDGE_GROUPS = [
    { key: 'wing-left', label: '냉동실 문짝', count: 5, wing: true },
    { key: 'main-left', label: '냉동실 본체', count: 6, wing: false },
    { key: 'main-right', label: '냉장실 본체', count: 6, wing: false },
    { key: 'wing-right', label: '냉장실 문짝', count: 5, wing: true },
  ];

  // 냉장고 실사진(fridge-photo.png) 위에 겹칠 칸 좌표 (사진 크기 대비 %).
  // 사진을 눈대중으로 보고 잡은 대략값이라, 실제로 봤을 때 어긋나는 칸이 있으면
  // 여기 숫자만 조정하면 된다.
  const COMPARTMENT_RECTS = {
    'wing-left-1': { left: 7.370786516853933, top: 9.52310141489664, width: 15.007651010194234, height: 8.677041508648923 },
    'wing-left-2': { left: 7.925060683026474, top: 26.968390194382085, width: 14.438321098395393, height: 8.899692125992132 },
    'wing-left-3': { left: 7.8051558299501504, top: 44.42860661966225, width: 14.663045342931031, height: 8.231746501562988 },
    'wing-left-4': { left: 7.715398469759083, top: 66.8609835900185, width: 14.767864734390347, height: 9.122334534722892 },
    'wing-left-5': { left: 8.044950678107444, top: 81.8721074815402, width: 14.093717717843646, height: 10.54333393040368 },
    'main-left-1': { left: 26.79775966687149, top: 9.003791014507451, width: 15.033702721756496, height: 13.894368573478339 },
    'main-left-2': { left: 26.573026849982444, top: 24.452870808500347, width: 15.483151210827774, height: 12.558502235022006 },
    'main-left-3': { left: 26.57303542233585, top: 38.12079973113999, width: 15.483142638474368, height: 12.558502235022006 },
    'main-left-4': { left: 26.573026849982444, top: 51.12079973113999, width: 15.932591127545646, height: 11 },
    'main-left-5': { left: 26.79775109451808, top: 63.226435404250175, width: 15.7078583106566, height: 12.328275816264384 },
    'main-left-6': { left: 26.57303542233585, top: 75.99620473890403, width: 15.93258255519224, height: 13.554711220514555 },
    'main-right-1': { left: 45.15728965502107, top: 8.558504358316268, width: 23.34831117780021, height: 14.562297496117981 },
    'main-right-2': { left: 45.15730679972788, top: 24.007586275603426, width: 22.898862688728933, height: 13.003791014507451 },
    'main-right-3': { left: 45.15730679972788, top: 38.120803977728514, width: 22.67416416125351, height: 12.113217702125086 },
    'main-right-4': { left: 45.15730679972788, top: 51.566088510625434, width: 22.22471567218223, height: 10.554711220514555 },
    'main-right-5': { left: 45.15730679972788, top: 63.44907554740437, width: 21.77528432781777, height: 11.660346893624741 },
    'main-right-6': { left: 45.15730679972788, top: 76.21885337523527, width: 22, height: 12.664133661543667 },
    'wing-right-1': { left: 72.2470704455609, top: 9.834682616136842, width: 20.29239196303605, height: 6.832999420078698 },
    'wing-right-2': { left: 71.25843953757602, top: 21.398510669249198, width: 21.610536791025165, height: 8.792019952402985 },
    'wing-right-3': { left: 71.15358643119552, top: 38.46874325665747, width: 22.149761497213355, height: 10.30635387709871 },
    'wing-right-4': { left: 71.24337979301924, top: 80.44579500753463, width: 21.610579078299764, height: 11.100640514615254 },
    'wing-right-5': { left: 71.25842696629213, top: 62.58346858638693, width: 22.149761497213355, height: 10.491809529108572 },
  };

  function allCompartmentIds() {
    const ids = [];
    FRIDGE_GROUPS.forEach((g) => {
      for (let i = 1; i <= g.count; i++) ids.push(`${g.key}-${i}`);
    });
    return ids;
  }

  function compartmentLabel(compartmentId) {
    for (const g of FRIDGE_GROUPS) {
      if (compartmentId.indexOf(g.key + '-') === 0) {
        const n = compartmentId.slice(g.key.length + 1);
        return `${g.label} ${n}`;
      }
    }
    return compartmentId;
  }

  // ---- Firestore 컬렉션 & 실시간 동기화 ----
  // 노트북/폰 등 여러 기기가 같은 Firestore 데이터를 구독한다. 한쪽에서 쓰면
  // onSnapshot 콜백이 자동으로 불려서 다른 기기 화면도 갱신된다 (새로고침 불필요).
  const categoriesCol = collection(db, 'categories');
  const itemsCol = collection(db, 'items');

  let state = { categories: [], items: [] };
  let activeTab = null; // 카테고리 최초 로드 전까지는 아직 정해지지 않음
  let listenersStarted = false;

  // 최초 로그인 시 Firestore가 비어있으면 seed-data.js 데이터로 한 번만 채운다.
  // (기존 카테고리/품목 id를 그대로 재사용해서 FRIDGE_ID 등 참조가 안 깨지게 함)
  async function ensureSeeded() {
    const existing = await getDocs(categoriesCol);
    if (!existing.empty) return;

    const seed = (window.SEED_DATA && Array.isArray(window.SEED_DATA.categories) && Array.isArray(window.SEED_DATA.items))
      ? window.SEED_DATA
      : { categories: DEFAULT_CATEGORIES, items: [] };

    const batch = writeBatch(db);
    seed.categories.forEach((cat, idx) => {
      batch.set(doc(categoriesCol, cat.id), { name: cat.name, order: idx });
    });
    seed.items.forEach((item) => {
      const { id, ...rest } = item;
      batch.set(doc(itemsCol, id), { createdAt: Date.now(), ...rest });
    });
    await batch.commit();
  }

  function startListeners() {
    if (listenersStarted) return;
    listenersStarted = true;

    onSnapshot(query(categoriesCol, orderBy('order')), (snap) => {
      state.categories = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      if (activeTab === null) {
        // 최초 로드: 첫 카테고리(냉장고)를 기본 탭으로
        activeTab = state.categories[0] ? state.categories[0].id : ALL_TAB;
      } else if (activeTab !== ALL_TAB && !state.categories.find((c) => c.id === activeTab)) {
        // 지금 보고 있던 카테고리가 삭제된 경우
        activeTab = state.categories[0] ? state.categories[0].id : ALL_TAB;
      }
      render();
    });

    onSnapshot(query(itemsCol, orderBy('createdAt')), (snap) => {
      state.items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      render();
    });
  }

  const READONLY_KEY = 'home-inventory-readonly';
  const storedReadOnly = localStorage.getItem(READONLY_KEY);
  let readOnly = storedReadOnly === null ? true : storedReadOnly === 'true';

  const tabsEl = document.getElementById('tabs');
  const itemListEl = document.getElementById('itemList');
  const emptyMsgEl = document.getElementById('emptyMsg');
  const addFormEl = document.getElementById('addForm');
  const categoryToolbarEl = document.getElementById('categoryToolbar');
  const itemNameEl = document.getElementById('itemName');
  const itemQtyEl = document.getElementById('itemQty');
  const itemExpiryEl = document.getElementById('itemExpiry');
  const itemMemoEl = document.getElementById('itemMemo');
  const itemPhotoEl = document.getElementById('itemPhoto');

  const fridgeLeftColEl = document.getElementById('fridgeLeftCol');
  const fridgePhotoInnerEl = document.getElementById('fridgePhotoInner');
  const fridgeDiagramEl = document.getElementById('fridgeDiagram');
  const fridgeDiagramToolbarEl = document.getElementById('fridgeDiagramToolbar');
  const selectAllBtnEl = document.getElementById('selectAllCompartmentsBtn');
  const calibrateToggleBtnEl = document.getElementById('calibrateToggleBtn');
  const copyRectsBtnEl = document.getElementById('copyRectsBtn');

  // 냉장고 사진 위 칸 위치를 드래그로 직접 보정하는 모드.
  // 새로고침해도 유지되게 localStorage에 저장해두고, 다 맞춘 뒤엔
  // "좌표 복사"로 COMPARTMENT_RECTS 코드를 뽑아서 영구 반영할 수 있게 한다.
  let calibrating = false;
  const RECTS_OVERRIDE_KEY = 'home-inventory-rect-calibration';
  (function loadRectOverrides() {
    try {
      const saved = JSON.parse(localStorage.getItem(RECTS_OVERRIDE_KEY) || 'null');
      if (saved) {
        Object.keys(saved).forEach((k) => {
          if (COMPARTMENT_RECTS[k]) COMPARTMENT_RECTS[k] = saved[k];
        });
      }
    } catch (e) { /* 무시 */ }
  })();

  function clampPct(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function saveRectOverrides() {
    localStorage.setItem(RECTS_OVERRIDE_KEY, JSON.stringify(COMPARTMENT_RECTS));
  }

  function makeCellDraggable(cell, compartmentId) {
    cell.addEventListener('pointerdown', (e) => {
      if (!calibrating) return;
      if (e.target.closest('.fov-resize-handle')) return;
      e.preventDefault();
      const wrapRect = fridgePhotoInnerEl.getBoundingClientRect();
      const rect = COMPARTMENT_RECTS[compartmentId];
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = rect.left;
      const startTop = rect.top;
      document.body.style.userSelect = 'none';
      function onMove(ev) {
        const dxPct = (ev.clientX - startX) / wrapRect.width * 100;
        const dyPct = (ev.clientY - startY) / wrapRect.height * 100;
        rect.left = clampPct(startLeft + dxPct, 0, 100 - rect.width);
        rect.top = clampPct(startTop + dyPct, 0, 100 - rect.height);
        cell.style.left = rect.left + '%';
        cell.style.top = rect.top + '%';
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.body.style.userSelect = '';
        saveRectOverrides();
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  }

  function makeHandleResizable(handle, cell, compartmentId) {
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const wrapRect = fridgePhotoInnerEl.getBoundingClientRect();
      const rect = COMPARTMENT_RECTS[compartmentId];
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = rect.width;
      const startH = rect.height;
      document.body.style.userSelect = 'none';
      function onMove(ev) {
        const dwPct = (ev.clientX - startX) / wrapRect.width * 100;
        const dhPct = (ev.clientY - startY) / wrapRect.height * 100;
        rect.width = clampPct(startW + dwPct, 3, 100 - rect.left);
        rect.height = clampPct(startH + dhPct, 3, 100 - rect.top);
        cell.style.width = rect.width + '%';
        cell.style.height = rect.height + '%';
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.body.style.userSelect = '';
        saveRectOverrides();
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  }

  const photoLightboxEl = document.getElementById('photoLightbox');
  const photoLightboxImgEl = document.getElementById('photoLightboxImg');
  const moveModalEl = document.getElementById('moveModal');
  const moveDiagramEl = document.getElementById('moveDiagram');

  const itemDetailModalEl = document.getElementById('itemDetailModal');
  const detailModalTitleEl = document.getElementById('detailModalTitle');
  const detailPhotoColEl = document.getElementById('detailPhotoCol');
  const detailModalPhotoEl = document.getElementById('detailModalPhoto');
  const detailPhotoPrevEl = document.getElementById('detailPhotoPrev');
  const detailPhotoNextEl = document.getElementById('detailPhotoNext');
  const detailPhotoDotsEl = document.getElementById('detailPhotoDots');
  const detailModalCompartmentEl = document.getElementById('detailModalCompartment');
  const detailModalQtyEl = document.getElementById('detailModalQty');
  const detailModalDdayEl = document.getElementById('detailModalDday');
  const detailModalMemoEl = document.getElementById('detailModalMemo');
  let detailPhotos = [];
  let detailPhotoIndex = 0;

  const addItemModalEl = document.getElementById('addItemModal');
  const addModalTitleEl = document.getElementById('addModalTitle');
  const mItemNameEl = document.getElementById('mItemName');
  const mItemQtyEl = document.getElementById('mItemQty');
  const mItemExpiryEl = document.getElementById('mItemExpiry');
  const mItemMemoEl = document.getElementById('mItemMemo');
  const mItemPhotoEl = document.getElementById('mItemPhoto');

  // 냉장고 탭에서 화면에 표시할(리스트에 노출할) 칸들 — 여러 칸 동시 선택 가능
  let selectedCompartments = new Set();
  // + 버튼으로 연 추가 모달이 지금 겨냥하고 있는 칸
  let addTargetCompartment = null;
  let moveItemId = null;

  function openAddModal(compartmentId) {
    addTargetCompartment = compartmentId;
    addModalTitleEl.textContent = `🧊 ${compartmentLabel(compartmentId)}에 추가`;
    mItemNameEl.value = '';
    mItemQtyEl.value = '';
    mItemExpiryEl.value = '';
    mItemMemoEl.value = '';
    mItemPhotoEl.value = '';
    addItemModalEl.hidden = false;
    mItemNameEl.focus();
  }

  function closeAddModal() {
    addItemModalEl.hidden = true;
    addTargetCompartment = null;
  }

  async function addModalItem() {
    const name = mItemNameEl.value.trim();
    if (!name) { mItemNameEl.focus(); return; }
    if (!addTargetCompartment) return;

    const newRef = doc(itemsCol);
    const photos = await compressImages(mItemPhotoEl.files);
    await setDoc(newRef, {
      categoryId: FRIDGE_ID,
      compartment: addTargetCompartment,
      name,
      qty: mItemQtyEl.value.trim(),
      expiry: mItemExpiryEl.value || null,
      memo: mItemMemoEl.value.trim(),
      photos,
      createdAt: Date.now(),
    });
    selectedCompartments.add(addTargetCompartment);
    mItemNameEl.value = '';
    mItemQtyEl.value = '';
    mItemExpiryEl.value = '';
    mItemMemoEl.value = '';
    mItemPhotoEl.value = '';
    mItemNameEl.focus();
    render();
  }

  function openMoveModal(itemId) {
    const item = state.items.find((it) => it.id === itemId);
    if (!item) return;
    moveItemId = itemId;
    renderMoveDiagram(item.compartment);
    moveModalEl.hidden = false;
  }

  function closeMoveModal() {
    moveModalEl.hidden = true;
    moveItemId = null;
  }

  function renderMoveDiagram(currentCompartmentId) {
    moveDiagramEl.innerHTML = '';

    FRIDGE_GROUPS.forEach((g) => {
      const col = document.createElement('div');
      col.className = 'fridge-col' + (g.wing ? ' wing' : '');

      const label = document.createElement('div');
      label.className = 'fridge-col-label';
      label.textContent = g.label;
      col.appendChild(label);

      for (let i = 1; i <= g.count; i++) {
        const compartmentId = `${g.key}-${i}`;
        const items = fridgeItemsIn(compartmentId);
        const worstDays = items.reduce((acc, it) => {
          const d = daysUntil(it.expiry);
          if (d === null) return acc;
          return acc === null ? d : Math.min(acc, d);
        }, null);
        const cls = urgencyClass(worstDays);

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'fridge-cell'
          + (items.length ? ' has-items' : '')
          + (cls ? ' ' + cls : '')
          + (compartmentId === currentCompartmentId ? ' selected' : '');

        const num = document.createElement('div');
        num.className = 'fc-num';
        num.textContent = i;
        cell.appendChild(num);

        cell.addEventListener('click', () => moveToCompartment(compartmentId));
        col.appendChild(cell);
      }

      moveDiagramEl.appendChild(col);
    });
  }

  async function moveToCompartment(compartmentId) {
    const item = state.items.find((it) => it.id === moveItemId);
    if (!item) { closeMoveModal(); return; }
    await updateDoc(doc(itemsCol, moveItemId), { compartment: compartmentId });
    selectedCompartments.add(compartmentId);
    closeMoveModal();
  }

  // Storage는 무료 플랜에서 못 써서(Blaze 업그레이드 필요), 사진은 캔버스로
  // 축소·압축한 뒤 base64 dataURL 그대로 Firestore 문서에 저장한다.
  // (800px·JPEG 72% 압축 기준 보통 수십~150KB 정도라 문서당 1MB 한도 안에 충분히 들어감)
  function compressImage(file, maxDim, quality) {
    maxDim = maxDim || 800;
    quality = quality || 0.72;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Firestore 문서 1MB 한도 안에 넉넉히 들어가도록 품목당 사진은 최대 6장까지만 받는다.
  const MAX_PHOTOS_PER_ITEM = 6;

  async function compressImages(fileList) {
    const files = Array.from(fileList || []).slice(0, MAX_PHOTOS_PER_ITEM);
    const results = [];
    for (const file of files) {
      try { results.push(await compressImage(file)); } catch (e) { /* 무시 */ }
    }
    return results;
  }

  function openLightbox(src) {
    photoLightboxImgEl.src = src;
    photoLightboxEl.hidden = false;
  }

  function closeLightbox() {
    photoLightboxEl.hidden = true;
    photoLightboxImgEl.src = '';
  }

  function getItemPhotos(item) {
    if (item.photos && item.photos.length) return item.photos;
    return item.photo ? [item.photo] : [];
  }

  function renderDetailPhoto() {
    const photo = detailPhotos[detailPhotoIndex];
    detailModalPhotoEl.src = photo || '';
    detailPhotoPrevEl.hidden = detailPhotos.length < 2;
    detailPhotoNextEl.hidden = detailPhotos.length < 2;
    detailPhotoDotsEl.hidden = detailPhotos.length < 2;
    detailPhotoDotsEl.innerHTML = '';
    if (detailPhotos.length > 1) {
      detailPhotos.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'item-detail-dot' + (i === detailPhotoIndex ? ' active' : '');
        dot.addEventListener('click', () => {
          detailPhotoIndex = i;
          renderDetailPhoto();
        });
        detailPhotoDotsEl.appendChild(dot);
      });
    }
  }

  function openItemDetailModal(item) {
    const days = daysUntil(item.expiry);

    detailModalTitleEl.textContent = item.name;

    detailPhotos = getItemPhotos(item);
    detailPhotoIndex = 0;
    detailModalPhotoEl.alt = item.name;
    if (detailPhotos.length) {
      detailPhotoColEl.hidden = false;
      renderDetailPhoto();
    } else {
      detailPhotoColEl.hidden = true;
    }

    if (item.categoryId === FRIDGE_ID && item.compartment) {
      detailModalCompartmentEl.textContent = `📍 ${compartmentLabel(item.compartment)}`;
      detailModalCompartmentEl.hidden = false;
    } else {
      detailModalCompartmentEl.hidden = true;
    }

    if (item.qty) {
      detailModalQtyEl.textContent = `수량: ${item.qty}`;
      detailModalQtyEl.hidden = false;
    } else {
      detailModalQtyEl.hidden = true;
    }

    if (item.expiry) {
      detailModalDdayEl.textContent = ddayLabel(days);
      detailModalDdayEl.hidden = false;
    } else {
      detailModalDdayEl.hidden = true;
    }

    if (item.memo) {
      detailModalMemoEl.textContent = item.memo;
      detailModalMemoEl.hidden = false;
    } else {
      detailModalMemoEl.hidden = true;
    }

    itemDetailModalEl.hidden = false;
  }

  function closeItemDetailModal() {
    itemDetailModalEl.hidden = true;
  }

  function triggerPhotoPicker(itemId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.addEventListener('change', async () => {
      if (!input.files.length) return;
      try {
        const item = state.items.find((it) => it.id === itemId);
        const existing = item ? getItemPhotos(item) : [];
        const added = await compressImages(input.files);
        const photos = existing.concat(added).slice(0, MAX_PHOTOS_PER_ITEM);
        await updateDoc(doc(itemsCol, itemId), { photos, photo: null });
      } catch (e) {
        alert('사진을 불러오지 못했어요.');
      }
    });
    input.click();
  }

  function todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diffMs = target.getTime() - todayMidnight().getTime();
    return Math.round(diffMs / 86400000);
  }

  function urgencyClass(days) {
    if (days === null) return '';
    if (days <= 3) return 'expired';
    if (days <= 7) return 'soon';
    return '';
  }

  function ddayLabel(days) {
    if (days === null) return '';
    if (days === 0) return '기한이 오늘까지예요!';

    const absDays = Math.abs(days);
    if (absDays >= 30) {
      const months = Math.floor(absDays / 30);
      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      const monthText = years > 0
        ? (remMonths > 0 ? `${years}년 ${remMonths}개월` : `${years}년`)
        : `${months}개월`;
      return days < 0 ? `기한이 ${monthText} 지났어요!` : `기한이 ${monthText} 남았어요`;
    }

    return days < 0 ? `기한이 ${absDays}일 지났어요!` : `기한이 ${days}일 남았어요`;
  }

  function renderTabs() {
    tabsEl.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'tab' + (activeTab === ALL_TAB ? ' active' : '');
    allBtn.textContent = '전체';
    allBtn.addEventListener('click', () => { activeTab = ALL_TAB; render(); });
    tabsEl.appendChild(allBtn);

    state.categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'tab' + (activeTab === cat.id ? ' active' : '');
      btn.textContent = cat.name;
      btn.addEventListener('click', () => { activeTab = cat.id; render(); });
      tabsEl.appendChild(btn);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'tab add-tab';
    addBtn.textContent = '+ 카테고리';
    addBtn.addEventListener('click', addCategory);
    tabsEl.appendChild(addBtn);
  }

  async function addCategory() {
    const name = prompt('새 카테고리 이름을 입력해주세요');
    if (!name || !name.trim()) return;
    const ref = await addDoc(categoriesCol, { name: name.trim(), order: Date.now() });
    activeTab = ref.id;
    render();
  }

  async function renameCategory() {
    const cat = state.categories.find((c) => c.id === activeTab);
    if (!cat) return;
    const name = prompt('새 이름을 입력해주세요', cat.name);
    if (!name || !name.trim()) return;
    await updateDoc(doc(categoriesCol, cat.id), { name: name.trim() });
  }

  async function deleteCategory() {
    const cat = state.categories.find((c) => c.id === activeTab);
    if (!cat) return;
    const count = state.items.filter((it) => it.categoryId === cat.id).length;
    const msg = count > 0
      ? `"${cat.name}" 카테고리를 삭제하면 안의 품목 ${count}개도 함께 삭제돼요. 계속할까요?`
      : `"${cat.name}" 카테고리를 삭제할까요?`;
    if (!confirm(msg)) return;

    const itemsSnap = await getDocs(query(itemsCol, where('categoryId', '==', cat.id)));
    const batch = writeBatch(db);
    itemsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(categoriesCol, cat.id));
    await batch.commit();

    activeTab = state.categories.find((c) => c.id !== cat.id) ? state.categories.find((c) => c.id !== cat.id).id : ALL_TAB;
    render();
  }

  async function addItem() {
    const name = itemNameEl.value.trim();
    if (!name) { itemNameEl.focus(); return; }
    if (activeTab === ALL_TAB) {
      alert('품목을 추가하려면 먼저 카테고리 탭을 선택해주세요.');
      return;
    }
    const newRef = doc(itemsCol);
    const photos = await compressImages(itemPhotoEl.files);
    await setDoc(newRef, {
      categoryId: activeTab,
      name,
      qty: itemQtyEl.value.trim(),
      expiry: itemExpiryEl.value || null,
      memo: itemMemoEl.value.trim(),
      photos,
      createdAt: Date.now(),
    });
    itemNameEl.value = '';
    itemQtyEl.value = '';
    itemExpiryEl.value = '';
    itemMemoEl.value = '';
    itemPhotoEl.value = '';
    itemNameEl.focus();
    render();
  }

  async function deleteItem(id) {
    await deleteDoc(doc(itemsCol, id));
  }

  async function editItem(id) {
    const item = state.items.find((it) => it.id === id);
    if (!item) return;
    const name = prompt('품명', item.name);
    if (name === null) return;
    const qty = prompt('수량', item.qty || '');
    if (qty === null) return;
    const expiry = prompt('유통기한 (YYYY-MM-DD, 없으면 비워두기)', item.expiry || '');
    if (expiry === null) return;
    const memo = prompt('메모', item.memo || '');
    if (memo === null) return;
    await updateDoc(doc(itemsCol, id), {
      name: name.trim() || item.name,
      qty: qty.trim(),
      expiry: expiry.trim() || null,
      memo: memo.trim(),
    });
  }

  function getVisibleItems() {
    let items;
    if (activeTab === ALL_TAB) {
      items = state.items.slice();
    } else if (activeTab === FRIDGE_ID) {
      items = state.items.filter((it) => it.categoryId === FRIDGE_ID && selectedCompartments.has(it.compartment));
    } else {
      items = state.items.filter((it) => it.categoryId === activeTab);
    }
    items.sort((a, b) => {
      const da = daysUntil(a.expiry);
      const db = daysUntil(b.expiry);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    return items;
  }

  function categoryName(id) {
    const cat = state.categories.find((c) => c.id === id);
    return cat ? cat.name : '';
  }

  function buildItemCard(item, opts) {
    const { showCategoryTag, showCompartmentTag } = opts || {};
    const days = daysUntil(item.expiry);
    const cls = urgencyClass(days);

    const card = document.createElement('div');
    card.className = 'item-card' + (cls ? ' ' + cls : '');

    const itemPhotos = getItemPhotos(item);
    if (itemPhotos.length) {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'item-thumb-wrap';
      const thumb = document.createElement('img');
      thumb.className = 'item-thumb';
      thumb.src = itemPhotos[0];
      thumb.alt = item.name;
      thumbWrap.appendChild(thumb);
      if (itemPhotos.length > 1) {
        const badge = document.createElement('span');
        badge.className = 'item-thumb-badge';
        badge.textContent = `+${itemPhotos.length - 1}`;
        thumbWrap.appendChild(badge);
      }
      card.appendChild(thumbWrap);
    }

    const main = document.createElement('div');
    main.className = 'item-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'item-name';
    nameEl.textContent = item.name;
    if (showCategoryTag || showCompartmentTag) {
      const tag = document.createElement('span');
      tag.className = 'item-cat-tag';
      let label = showCategoryTag ? categoryName(item.categoryId) : '';
      if (showCompartmentTag && item.categoryId === FRIDGE_ID && item.compartment) {
        label = label ? `${label} · ${compartmentLabel(item.compartment)}` : compartmentLabel(item.compartment);
      }
      tag.textContent = label;
      nameEl.appendChild(tag);
    }
    main.appendChild(nameEl);

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    if (item.qty) {
      const q = document.createElement('span');
      q.textContent = item.qty;
      meta.appendChild(q);
    }
    if (item.expiry) {
      const dd = document.createElement('span');
      dd.className = 'dday' + (cls ? ' ' + cls : '');
      dd.textContent = ddayLabel(days);
      meta.appendChild(dd);
    }
    main.appendChild(meta);

    if (item.memo) {
      const memoEl = document.createElement('div');
      memoEl.className = 'item-memo';
      memoEl.textContent = item.memo;
      main.appendChild(memoEl);
    }

    card.appendChild(main);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = '수정';
    editBtn.addEventListener('click', () => editItem(item.id));
    const photoBtn = document.createElement('button');
    photoBtn.textContent = '사진추가';
    photoBtn.addEventListener('click', () => triggerPhotoPicker(item.id));
    let moveBtn = null;
    if (item.categoryId === FRIDGE_ID) {
      moveBtn = document.createElement('button');
      moveBtn.textContent = '칸 이동';
      moveBtn.addEventListener('click', () => openMoveModal(item.id));
    }
    const delBtn = document.createElement('button');
    delBtn.className = 'del';
    delBtn.textContent = '삭제';
    delBtn.addEventListener('click', () => {
      if (confirm(`"${item.name}" 삭제할까요?`)) deleteItem(item.id);
    });
    actions.appendChild(editBtn);
    actions.appendChild(photoBtn);
    if (moveBtn) actions.appendChild(moveBtn);
    if (itemPhotos.length) {
      const removePhotoBtn = document.createElement('button');
      removePhotoBtn.className = 'del';
      removePhotoBtn.textContent = '사진전체삭제';
      removePhotoBtn.addEventListener('click', () => {
        updateDoc(doc(itemsCol, item.id), { photos: [], photo: null });
      });
      actions.appendChild(removePhotoBtn);
    }
    actions.appendChild(delBtn);
    card.appendChild(actions);

    card.addEventListener('click', (e) => {
      if (e.target.closest('.item-actions')) return;
      openItemDetailModal(item);
    });

    return card;
  }

  function renderItems() {
    itemListEl.innerHTML = '';
    const items = getVisibleItems();
    emptyMsgEl.hidden = items.length > 0;
    if (activeTab === FRIDGE_ID) {
      emptyMsgEl.textContent = selectedCompartments.size === 0
        ? '칸을 선택하면 그 안의 품목이 여기 표시돼요.'
        : '이 칸엔 아직 아무것도 없어요.';
    } else {
      emptyMsgEl.textContent = '등록된 품목이 없어요.';
    }

    items.forEach((item) => {
      itemListEl.appendChild(buildItemCard(item, {
        showCategoryTag: activeTab === ALL_TAB,
        showCompartmentTag: activeTab === ALL_TAB || activeTab === FRIDGE_ID,
      }));
    });
  }

  // ---- 냉장고 구간도 ----

  function fridgeItemsIn(compartmentId) {
    return state.items.filter((it) => it.categoryId === FRIDGE_ID && it.compartment === compartmentId);
  }

  function renderFridgeDiagram() {
    fridgeDiagramEl.innerHTML = '';

    allCompartmentIds().forEach((compartmentId) => {
      const rect = COMPARTMENT_RECTS[compartmentId];
      if (!rect) return;

      const items = fridgeItemsIn(compartmentId);

      // div로 만든다: 안에 "+" 버튼을 또 넣어야 하는데 button 안에 button은 못 넣음
      const cell = document.createElement('div');
      cell.setAttribute('role', 'button');
      cell.tabIndex = 0;
      cell.className = 'fov-cell'
        + (selectedCompartments.has(compartmentId) ? ' selected' : '')
        + (calibrating ? ' calibrating' : '');
      cell.style.left = rect.left + '%';
      cell.style.top = rect.top + '%';
      cell.style.width = rect.width + '%';
      cell.style.height = rect.height + '%';
      cell.title = compartmentLabel(compartmentId);

      const blocksWrap = document.createElement('div');
      blocksWrap.className = 'fov-blocks';
      items.forEach((it) => {
        const block = document.createElement('div');
        const bcls = urgencyClass(daysUntil(it.expiry));
        block.className = 'fov-block' + (bcls ? ' ' + bcls : '');
        blocksWrap.appendChild(block);
      });
      cell.appendChild(blocksWrap);

      cell.addEventListener('click', () => { if (!calibrating) toggleCompartment(compartmentId); });
      cell.addEventListener('keydown', (e) => {
        if (calibrating) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCompartment(compartmentId); }
      });

      if (calibrating) {
        const handle = document.createElement('div');
        handle.className = 'fov-resize-handle';
        cell.appendChild(handle);
        makeCellDraggable(cell, compartmentId);
        makeHandleResizable(handle, cell, compartmentId);
      }

      fridgeDiagramEl.appendChild(cell);
    });
  }

  function toggleCompartment(compartmentId) {
    if (selectedCompartments.has(compartmentId)) {
      selectedCompartments.delete(compartmentId);
    } else {
      selectedCompartments.add(compartmentId);
    }
    render();
  }

  function toggleSelectAllCompartments() {
    const allIds = allCompartmentIds();
    const allSelected = allIds.every((id) => selectedCompartments.has(id));
    selectedCompartments = allSelected ? new Set() : new Set(allIds);
    render();
  }

  function toggleReadOnly() {
    readOnly = !readOnly;
    localStorage.setItem(READONLY_KEY, String(readOnly));
    if (readOnly) calibrating = false;
    render();
  }

  function render() {
    if (activeTab === null) return; // 카테고리 목록이 아직 도착 전
    renderTabs();
    tabsEl.hidden = true;
    const isFridge = activeTab === FRIDGE_ID;
    const isCategory = activeTab !== ALL_TAB;

    document.body.classList.toggle('readonly', readOnly);
    document.body.classList.toggle('fridge-view', isFridge);
    document.getElementById('readOnlyToggleBtn').textContent = readOnly ? '✏️ 편집 모드로' : '👁 읽기 전용으로';

    addFormEl.hidden = !isCategory || isFridge;
    categoryToolbarEl.hidden = !isCategory || isFridge;
    fridgeLeftColEl.hidden = !isFridge;
    calibrateToggleBtnEl.hidden = readOnly;
    calibrateToggleBtnEl.textContent = calibrating ? '✅ 보정 완료' : '📐 칸 위치 보정';
    copyRectsBtnEl.hidden = readOnly || !calibrating;
    if (isFridge) {
      const allIds = allCompartmentIds();
      const allSelected = allIds.every((id) => selectedCompartments.has(id));
      selectAllBtnEl.textContent = allSelected ? '전체해제' : '전체선택';
    }

    if (isFridge) renderFridgeDiagram();
    renderItems();
  }

  document.getElementById('addItemBtn').addEventListener('click', addItem);
  [itemNameEl, itemQtyEl, itemMemoEl].forEach((el) => {
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });
  });
  document.getElementById('renameCategoryBtn').addEventListener('click', renameCategory);
  document.getElementById('deleteCategoryBtn').addEventListener('click', deleteCategory);
  selectAllBtnEl.addEventListener('click', toggleSelectAllCompartments);

  calibrateToggleBtnEl.addEventListener('click', () => {
    calibrating = !calibrating;
    render();
  });

  copyRectsBtnEl.addEventListener('click', () => {
    const text = 'const COMPARTMENT_RECTS = ' + JSON.stringify(COMPARTMENT_RECTS, null, 2) + ';';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('좌표가 복사됐어요. 이 내용을 클로드에게 붙여넣어 주세요.'))
        .catch(() => prompt('복사에 실패했어요, 아래 내용을 직접 복사해주세요', text));
    } else {
      prompt('아래 내용을 복사해주세요', text);
    }
  });

  photoLightboxEl.addEventListener('click', (e) => {
    if (e.target === photoLightboxEl) closeLightbox();
  });
  document.getElementById('closeMoveModalBtn').addEventListener('click', closeMoveModal);
  moveModalEl.addEventListener('click', (e) => {
    if (e.target === moveModalEl) closeMoveModal();
  });

  document.getElementById('mAddItemBtn').addEventListener('click', addModalItem);
  [mItemNameEl, mItemQtyEl, mItemMemoEl].forEach((el) => {
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') addModalItem(); });
  });
  document.getElementById('closeAddModalBtn').addEventListener('click', closeAddModal);
  addItemModalEl.addEventListener('click', (e) => {
    if (e.target === addItemModalEl) closeAddModal();
  });

  document.getElementById('closeDetailModalBtn').addEventListener('click', closeItemDetailModal);
  itemDetailModalEl.addEventListener('click', (e) => {
    if (e.target === itemDetailModalEl) closeItemDetailModal();
  });
  detailModalPhotoEl.addEventListener('click', () => {
    if (detailPhotos[detailPhotoIndex]) openLightbox(detailPhotos[detailPhotoIndex]);
  });
  detailPhotoPrevEl.addEventListener('click', () => {
    detailPhotoIndex = (detailPhotoIndex - 1 + detailPhotos.length) % detailPhotos.length;
    renderDetailPhoto();
  });
  detailPhotoNextEl.addEventListener('click', () => {
    detailPhotoIndex = (detailPhotoIndex + 1) % detailPhotos.length;
    renderDetailPhoto();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!photoLightboxEl.hidden) { closeLightbox(); return; }
    if (!moveModalEl.hidden) { closeMoveModal(); return; }
    if (!addItemModalEl.hidden) { closeAddModal(); return; }
    if (!itemDetailModalEl.hidden) { closeItemDetailModal(); return; }
  });

  document.getElementById('readOnlyToggleBtn').addEventListener('click', toggleReadOnly);

  // ---- 로그인 ----
  const loginScreenEl = document.getElementById('loginScreen');
  const appRootEl = document.getElementById('appRoot');
  const loginFormEl = document.getElementById('loginForm');
  const loginPinEl = document.getElementById('loginPin');
  const loginErrorEl = document.getElementById('loginError');

  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorEl.textContent = '';
    const pin = loginPinEl.value.trim();
    if (!pin) return;
    try {
      await signInWithEmailAndPassword(auth, FAMILY_LOGIN_EMAIL, pin);
    } catch (err) {
      loginErrorEl.textContent = 'PIN이 올바르지 않아요.';
      loginPinEl.value = '';
      loginPinEl.focus();
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      loginScreenEl.hidden = true;
      appRootEl.hidden = false;
      await ensureSeeded();
      startListeners();
    } else {
      loginScreenEl.hidden = false;
      appRootEl.hidden = true;
    }
  });
})();
