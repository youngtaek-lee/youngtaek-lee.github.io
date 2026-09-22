## Tailwind

Tailwind란 CSS 프레임워크인데, 기존에 일일이 클래스를 작성하는 방식보다 효율적으로 사용하기 위해 만들어진 CSS 규칙 모음이다.

### Bootstrap과 다른 점

Bootstrap은 완성된 컴포넌트로 제공한다면, Tailwind는 단일 유틸리티로 제공한다.

```html
<!-- Bootstrap -->
<button class="btn btn-primary">확인</button>

<!-- Tailwind -->
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">확인</button>
```

Tailwind의 장점은 개별 CSS 클래스로 사용하기 때문에 Bootstrap보다 조금 더 자유롭고, 용량도 덜 차지한다는 것이다.

### 실사용 통계

devographics팀이 진행한 [설문조사](https://survey.devographics.com/en-US/survey/state-of-css/2025)에 따르면 Tailwind 사용률은 Bootstrap을 앞섰고, 만족도도 62%로 더 높게 나타났다.

반면 W3Techs 통계에서는 Tailwind가 0.3%, Bootstrap이 13.6%로 정반대 결과가 나오는데, 이는 Tailwind가 빌드 시 통계에 잘 잡히지 않기 때문에 과소평가된 것으로 보인다.
