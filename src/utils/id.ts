// 순환참조 방지를 위해 ID 생성기를 독립 모듈로 분리

const KOREAN_SURNAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','손','배','백','허','유','남','심','노','하','곽','성','차','주','우','구','민','진','지','엄','채'];
const KOREAN_GIVEN = ['민준','서연','지호','수빈','예린','지훈','유나','현우','지원','서윤','도윤','은서','시우','지유','준서','채원','정환','다은','승현','예진','태현','윤아','상현','보경','재민','선영','우진','지민','동현','수진','성호','혜진','재현','미경','경수','은영','병철','정희','광호','순자','종현','영숙','진우','미숙'];

let _idCounter = 1;
export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${(_idCounter++).toString(36)}`;
}

export function randomKoreanName(): string {
  const s = KOREAN_SURNAMES[Math.floor(Math.random() * KOREAN_SURNAMES.length)];
  const g = KOREAN_GIVEN[Math.floor(Math.random() * KOREAN_GIVEN.length)];
  return s + g;
}
