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
    { key: 'wing-left', label: '좌 날개', count: 5, wing: true },
    { key: 'main-left', label: '좌 본체', count: 6, wing: false },
    { key: 'main-right', label: '우 본체', count: 6, wing: false },
    { key: 'wing-right', label: '우 날개', count: 5, wing: true },
  ];

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
  let readOnly = localStorage.getItem(READONLY_KEY) === 'true';

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

  const fridgeDiagramEl = document.getElementById('fridgeDiagram');
  const fridgeDiagramToolbarEl = document.getElementById('fridgeDiagramToolbar');
  const selectAllBtnEl = document.getElementById('selectAllCompartmentsBtn');

  const photoLightboxEl = document.getElementById('photoLightbox');
  const photoLightboxImgEl = document.getElementById('photoLightboxImg');
  const moveModalEl = document.getElementById('moveModal');
  const moveDiagramEl = document.getElementById('moveDiagram');

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
    let photo = null;
    const file = mItemPhotoEl.files[0];
    if (file) {
      try { photo = await compressImage(file); } catch (e) { photo = null; }
    }
    await setDoc(newRef, {
      categoryId: FRIDGE_ID,
      compartment: addTargetCompartment,
      name,
      qty: mItemQtyEl.value.trim(),
      expiry: mItemExpiryEl.value || null,
      memo: mItemMemoEl.value.trim(),
      photo,
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

  function openLightbox(src) {
    photoLightboxImgEl.src = src;
    photoLightboxEl.hidden = false;
  }

  function closeLightbox() {
    photoLightboxEl.hidden = true;
    photoLightboxImgEl.src = '';
  }

  function triggerPhotoPicker(itemId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const photo = await compressImage(file);
        await updateDoc(doc(itemsCol, itemId), { photo });
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
    if (days < 0) return `${Math.abs(days)}일 지남`;
    if (days === 0) return '오늘까지';
    return `D-${days}`;
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
    const name = prompt('새 카테고리 이름');
    if (!name || !name.trim()) return;
    const ref = await addDoc(categoriesCol, { name: name.trim(), order: Date.now() });
    activeTab = ref.id;
    render();
  }

  async function renameCategory() {
    const cat = state.categories.find((c) => c.id === activeTab);
    if (!cat) return;
    const name = prompt('카테고리 이름 변경', cat.name);
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
    let photo = null;
    const file = itemPhotoEl.files[0];
    if (file) {
      try { photo = await compressImage(file); } catch (e) { photo = null; }
    }
    await setDoc(newRef, {
      categoryId: activeTab,
      name,
      qty: itemQtyEl.value.trim(),
      expiry: itemExpiryEl.value || null,
      memo: itemMemoEl.value.trim(),
      photo,
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

    if (item.photo) {
      const thumb = document.createElement('img');
      thumb.className = 'item-thumb';
      thumb.src = item.photo;
      thumb.alt = item.name;
      thumb.addEventListener('click', () => openLightbox(item.photo));
      card.appendChild(thumb);
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
      dd.textContent = `${item.expiry} (${ddayLabel(days)})`;
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
    photoBtn.textContent = item.photo ? '사진변경' : '사진추가';
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
    if (item.photo) {
      const removePhotoBtn = document.createElement('button');
      removePhotoBtn.className = 'del';
      removePhotoBtn.textContent = '사진삭제';
      removePhotoBtn.addEventListener('click', () => {
        updateDoc(doc(itemsCol, item.id), { photo: null });
      });
      actions.appendChild(removePhotoBtn);
    }
    actions.appendChild(delBtn);
    card.appendChild(actions);

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

        const row = document.createElement('div');
        row.className = 'fridge-cell-row';

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'fridge-cell'
          + (items.length ? ' has-items' : '')
          + (cls ? ' ' + cls : '')
          + (selectedCompartments.has(compartmentId) ? ' selected' : '');

        const num = document.createElement('div');
        num.className = 'fc-num';
        num.textContent = i;
        cell.appendChild(num);

        const count = document.createElement('div');
        count.className = 'fc-count';
        count.textContent = items.length ? `품목 ${items.length}` : '비어있음';
        cell.appendChild(count);

        cell.addEventListener('click', () => toggleCompartment(compartmentId));
        row.appendChild(cell);

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'fridge-add-btn';
        addBtn.textContent = '+';
        addBtn.title = `${compartmentLabel(compartmentId)}에 품목 추가`;
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddModal(compartmentId);
        });
        row.appendChild(addBtn);

        col.appendChild(row);
      }

      fridgeDiagramEl.appendChild(col);
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
    render();
  }

  function render() {
    if (activeTab === null) return; // 카테고리 목록이 아직 도착 전
    renderTabs();
    const isFridge = activeTab === FRIDGE_ID;
    const isCategory = activeTab !== ALL_TAB;

    document.body.classList.toggle('readonly', readOnly);
    document.getElementById('readOnlyToggleBtn').textContent = readOnly ? '✏️ 편집 모드로' : '👁 읽기 전용으로';

    addFormEl.hidden = !isCategory || isFridge;
    categoryToolbarEl.hidden = !isCategory;
    fridgeDiagramEl.hidden = !isFridge;
    fridgeDiagramToolbarEl.hidden = !isFridge;
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

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!photoLightboxEl.hidden) { closeLightbox(); return; }
    if (!moveModalEl.hidden) { closeMoveModal(); return; }
    if (!addItemModalEl.hidden) { closeAddModal(); return; }
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
