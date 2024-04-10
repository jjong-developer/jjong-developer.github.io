// window.addEventListener('DOMContentLoaded', function() {

/**
 * firebase config variable
 */
const dbAuth = firebase.auth // 회원가입, 로그인, 로그아웃, 비밀번호 재설정, 회원탈퇴
const dbFireStore = firebase.firestore // 게시물 등록, 수정, 삭제
const dbStorage = firebase.storage // 저장 공간
const dbStorageRef = dbStorage().ref()
const googleProvider = new dbAuth.GoogleAuthProvider() // 구글 간편 로그인 (https://console.cloud.google.com/ 개발자 사이트 등록)
const facebookProvider = new dbAuth.FacebookAuthProvider() // 페이스북 간편 로그인 (https://developers.facebook.com/ 개발자 사이트 등록)
// const githubProvider = new dbAuth.GithubAuthProvider() // 깃허브 간편 로그인 (https://github.com/settings/ 개발자 사이트 등록)

/**
 * global variable
 */
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const todayDate = year+'-'+(('00'+month.toString()).slice(-2))+'-'+(('00'+day.toString()).slice(-2));
const headerSelector = document.querySelector('.header');
const titleSelector  = document.querySelectorAll('.title');
const topBtn = document.querySelector('#topBtn');
const skillBox = document.querySelectorAll('.skill-box');
const signInOutBtn = document.querySelector('#signInOutBtn');
const nameView = document.querySelector('#nameView');
const menuList = document.querySelectorAll('.menu li');
const tabMenuCategories = document.querySelectorAll('.tab-menu-categories li');
const tabMenuContent = document.querySelectorAll('.tab-menu-content');
let isUser; // 로그인 여/부 상태값을 받기 위함 -> html 파일내에서 생성한 태그는 사용안하는 용도이고 script내에서 동적으로 추가한 html만 사용하기 위함
let superAdmin = ['jongwook2.kim@gmail.com']; // 관리자 권한 이메일 설정
let usersList;
let isSuperAdmin, isModalBg = false;
let isCategories, isType;
let fileUpload;
let startPeriodData, endPeriodData, siteCategoriesData, siteTypeData, siteName, siteDescription, siteLink, siteThumbnailUrl = '';

/**
 * global function
 */
const modal = (title, contents) => { // 모달 함수
    const modalTempleat = '' +
        '<div id="modalBg" class="modal-bg"></div>' +
        '<div class="modal-wrap">' +
            '<div class="modal-close-btn">' +
                '<button type="button" onclick="modalClose();">' +
                '<img src="./images/close.png" alt="" />' +
                '</button>' +
            '</div>' +
            '<div class="modal">' +
                '<div class="modal-title">' +
                    '<h2>'+ title +'</h2>' +
                '</div>' +
                '<div class="modal-contents">' +
                    ''+ contents +'' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', modalTempleat);

    // document.querySelector('#modalBg').addEventListener('mouseup', (e) => { // 모달 밖 영역 이벤트 실행
    //     modalClose();
    // });

    headerFix('modal');
};

const modalClose = () => { // 모달 닫기 함수
    isModalBg = false;
    document.querySelector('#modalBg').remove();
    document.querySelector('.modal-wrap').remove();
}

const windowPopup = (contents, cancelBtn) => { // alert, confirm창 함수
    const popupTempleat = '' +
        '<div id="popupBg">' +
            '<div class="popup-wrap">' +
                '<div class="popup">' +
                    '<div class="popup-contents">' +
                        '<p>'+ contents +'</p>' +
                    '</div>' +
                    '<div class="popup-btn-wrap">' +
                        ''+ (cancelBtn !== undefined ? cancelBtn : '') +'' +
                        '<button id="windowPopupOk" type="button">확인</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', popupTempleat);

    headerFix('modal');

    document.querySelector('#windowPopupCancel, #windowPopupOk').addEventListener('click', () => { // alert, confirm창 취소/확인 버튼
        isModalBg = false;
        document.querySelector('#popupBg').remove();
    });
}

const headerFix = (type) => { // 플로팅박스들 띄워져있을때 scroll시 header부분 고정 함수
    isModalBg = true;

    document.addEventListener('mousewheel', () => {
        if (type === 'menu') {
            if (document.querySelector('.menu').classList.contains('active')) {
                headerSelector.removeAttribute('id');
            }
        } else if (type === 'modal') {
            if (isModalBg && document.querySelector('#modalBg').classList.contains('modal-bg')) {
                headerSelector.removeAttribute('id');
            }
        }
    });
}

const reload = () => { // 새로고침 함수
    window.location.reload();
}

const emailCheck = (str) => { // 이메일 정규식 체크 함수
    let regEmail = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;

    if (!regEmail.test(str)) {
        return false;
    } else {
        return true;
    }
}

const portfolioSite = () => { // 포트폴리오 사이트 글 등록, 수정 모달 함수
    modal(
    '프로젝트를 등록 해보세요 :)',
'<div>' +
            '<div class="modal-date-box-wrap">' +
                '<div class="modal-date-box">' +
                    '<label for="startPeriod">시작 기간: </label>' +
                    '<input id="startPeriod" type="date" name="startPeriod" max="' + todayDate + '" pattern="\d{4}/\d{2}/\d{2}" />' + // min="0000-00-00"
                '</div>' +
                '<div class="modal-date-box">' +
                    '<label for="endPeriod">종료 기간: </label>' +
                    '<input id="endPeriod" type="date" name="endPeriod" max="' + todayDate + '" pattern="\d{4}/\d{2}/\d{2}" />' +
                '</div>' +
            '</div>' +
            '<div class="modal-select-box-wrap">' +
                '<select id="siteCategories" class="modal-select-box">' +
                    '<option value="" selected="selected" disabled>분류 선택</option>' +
                    '<option value="호텔/팬션">호텔/팬션</option>' +
                    '<option value="쇼핑몰">쇼핑몰</option>' +
                    '<option value="교육/IT솔루션">교육/IT솔루션</option>' +
                    '<option value="제조장비 반도체산업">제조장비 반도체산업</option>' +
                    '<option value="기타">기타</option>' +
                '</select>' +
                '<select id="siteType" class="modal-select-box">' +
                    '<option value="" selected="selected" disabled>유형 선택</option>' +
                    '<option value="Responsive Web" title="반응형">Responsive Web</option>' +
                    '<option value="Adaptive Web" title="적응형">Adaptive Web</option>' +
                    '<option value="Hybrid App" title="하이브리드 앱">Hybrid App</option>' +
                '</select>' +
            '</div>' +
            '<input id="siteName" type="text" value="" autocomplete="off" placeholder="사이트 이름을(를) 입력해주세요." />' +
            '<textarea id="siteDescription" class="modal-textarea" placeholder="예시)&#13;&#10;참여 기여도 : Design(%), Publishing(%), Front(%), Back(%)&#13;&#10;사용 기술 : ~&#13;&#10;간략한 설명"></textarea>' +
            '<input id="siteLink" type="text" value="" autocomplete="off" placeholder="포트폴리오 주소을(를) 입력해주세요." />' +
            '<div class="file-box">' +
                '<input class="file-name" value="첨부파일명" disabled>' +
                '<label for="fileUploadFind">파일찾기</label>' +
                '<input id="fileUploadFind" class="file-upload-hidden" type="file">' +
            '</div>' +
        '</div>' +
        '<button id="writeBtn" class="modal-btn-type-1" type="button">등록하기</button>',
    );

    siteName = document.querySelector('#siteName');
    siteDescription = document.querySelector('#siteDescription');
    siteLink = document.querySelector('#siteLink');
}

const fileChange = () => { // 첨부파일 변경
    let fileNameTarget = document.querySelector('.file-name');

    document.querySelector('#fileUploadFind').addEventListener('change', (e) => {
        if (window.FileReader) {
            let fileTarget = e.target.files[0]; // 파일 추출
            let fileName = e.target.files[0].name; // 파일명 추출

            fileNameTarget.style.color = '#ffffff';
            fileNameTarget.value = fileName; // 변경할때마다 파일명을 input에 insert
            fileUpload = dbStorageRef.child('images/portfolio/' + fileName).put(fileTarget);

            fileUpload.on('state_changed', null, (error) => { // 이미지 업로드 여부
                console.log('업로드중 실패하였습니다, 잠시 후 다시 시도해주세요.\n', error.message);
            }, () => {
                fileUpload.snapshot.ref.getDownloadURL().then((url) => {
                    siteThumbnailUrl = url;
                });
            });
        }
    });
}

const calendarChange = (startType, endType) => { // 기간 시작 & 종료 날짜 선택
    let startPeriod = document.querySelector('#startPeriod');
    let endPeriod = document.querySelector('#endPeriod');

    if (startType === 'start') {
        startPeriod.addEventListener('change', (e) => {
            startPeriodData = e.target.value;
        });
    }
    if (endType === 'end') {
        endPeriod.addEventListener('change', (e) => {
            endPeriodData = e.target.value;
        });
    }
}

const siteCategoriesChange = () => { // 포트폴리오 사이트 분류 선택
    let siteCategories = document.querySelector('#siteCategories');

    siteCategories.addEventListener('change', (e) => {
        let categoriesSelectValue = siteCategories.options[siteCategories.selectedIndex].value;
        let siteCategoriesId = document.getElementById(e.target.id);

        for (let i = 0; i < siteCategoriesId.length; i += 1) {
            siteCategoriesId[i].removeAttribute('selected');
        }
        siteCategoriesId[siteCategoriesId.selectedIndex].setAttribute('selected', 'selected');

        isCategories = Boolean(siteCategoriesId[siteCategoriesId.selectedIndex].getAttribute('selected'));

        siteCategoriesData = categoriesSelectValue
    });
}

const siteTypeChange = () => { // 포트폴리오 사이트 유형 선택
    let siteType = document.querySelector('#siteType');

    siteType.addEventListener('change', (e) => {
        let typeSelectValue = siteType.options[siteType.selectedIndex].value;
        let siteTypeId = document.getElementById(e.target.id);

        for (let i = 0; i < siteTypeId.length; i += 1) {
            siteTypeId[i].removeAttribute('selected');
        }
        siteTypeId[siteTypeId.selectedIndex].setAttribute('selected', 'selected');

        isType = Boolean(siteTypeId[siteTypeId.selectedIndex].getAttribute('selected'));

        siteTypeData = typeSelectValue
    });
}

/**
 * mousewheel event
 */
document.addEventListener('mousewheel', (e) => {
    let wheelData = e.deltaY;

    if (wheelData > 0) { // 휠 내릴때
        headerSelector.id = 'hideTranslate';
        // headerSelector.animate(
        //     {
        //         transform: [
        //             'translateY(0px)',
        //             'translateY(-300px)'
        //         ]
        //     },
        //     {
        //         duration: 500,
        //         fill: 'forwards',
        //         easing: 'ease'
        //     }
        // );
    } else {
        headerSelector.removeAttribute('id');
    }
});

/**
 * scroll section title === menu title matching
 */
let interfaceObserver = new IntersectionObserver((e) => { // 요소를 자동적으로 감지
    e.forEach((el) => {
        if (el.isIntersecting) { // 화면에 요소가 보일때만
            menuList.forEach((menuEl) => {
                if (el.target.dataset.offset === menuEl.dataset.offset) {
                    menuEl.classList.add('active');
                } else {
                    menuEl.classList.remove('active');
                }
                // el.intersectionRatio
            });
        }
    });
}, {
    // rootMargin: '0px 0px 0px 0px'
});
for (let v of titleSelector) {
    interfaceObserver.observe(v);
}

/**
 * mobile menu
 */
document.querySelector('#mobileMenuBtn').addEventListener('click', () => {
    headerFix('menu');

    if (document.querySelector('.menu').classList.contains('active')) { // 메뉴 박스 닫힘
        document.querySelector('.menu').classList.remove('active');
        document.querySelector('.nav .menu').style.right = '-100%';
        setTimeout(() => { // menu style transition이 0.3초이므로 0.1초 빠르게 딜레이를 같게하기 위함
            document.querySelector('.header').style.height = 'unset';
        }, 200);
        document.querySelector('#mobileMenuBtn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z" fill="rgba(255,255,255,1)"/></svg>';
        document.querySelector('body').style.cssText = '';
        document.addEventListener('offscroll', (e) => {});
    } else { // 메뉴 박스 열림
        document.querySelector('.menu').classList.add('active');
        document.querySelector('.nav .menu').style.right = '0px';
        document.querySelector('.header').style.height = '100%';
        document.querySelector('#mobileMenuBtn').innerHTML = '<svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="rgba(255,255,255,1)"/></svg>';
        document.querySelector('body').style.cssText = 'overflow: hidden; height: 100%;';
        document.addEventListener('onscroll', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }
});

/**
 * menu click move scroll
 */
menuList.forEach((el, i) => {
    el.addEventListener('click', (e) => {
        let menuScroll = e.target.dataset.offset;
        let menuTarget = document.querySelector(menuScroll);

        menuList.forEach((el) => {
            el.classList.remove('active');
        });

        menuList[i].classList.add('active');

        if (menuScroll !== null) {
            if (document.querySelector('.menu').classList.contains('active')) { // 메뉴 박스 닫힘
                document.querySelector('.nav .menu').style.right = '-100%';
                setTimeout(() => { // menu style transition이 0.3초이므로 0.1초 빠르게 딜레이를 같게하기 위함
                    document.querySelector('.header').style.height = 'unset';
                }, 200);
                document.querySelector('.menu').classList.remove('active');
                document.querySelector('#mobileMenuBtn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z" fill="rgba(255,255,255,1)"/></svg>';
                document.querySelector('body').style.cssText = '';
                document.addEventListener('offscroll', (e) => {});
            }

            menuTarget.scrollIntoView({
                behavior: 'smooth'
            });
        } else {
            return;
        }
    });
});

/**
 * admin auth state
 */
dbAuth().onAuthStateChanged((user) => { // 로그인 상태 여/부
    console.log(user);

    isUser = user; // 로그인 상태값 저장

    if (user) {
        console.log("로그인 상태입니다.");

        if (superAdmin.includes(user.email)) {
            isSuperAdmin = true;
        } else {
            isSuperAdmin = false;
        }

        /**
         * user name view & user delete
         */
        nameView.innerHTML = '<span class="user-name">' +
                                '' + user.displayName + '' +
                            '</span>' +
                            '<span> 님, 환영합니다 :)</span>';

        let myInfoBox = '' +
            '<div class="my-info-box">' +
                '<span class="user-delete">회원 탈퇴</span>' +
                '<span class="user-modify">정보 수정</span>' +
            '</div>';

        document.querySelector('.user-name').addEventListener('mouseenter', () => { // 내 정보 박스 폼 생성
            document.querySelector('.user-name').insertAdjacentHTML('beforeend', myInfoBox);

            document.querySelector('.user-delete').addEventListener('click', () => { // 회원 탈퇴
                windowPopup('정말 회원 탈퇴하시겠습니까?', '<button id="windowPopupCancel" class="bg-danger" type="button">취소</button>');

                document.querySelector('#windowPopupOk').id = 'userDeleteBtn';
                document.querySelectorAll('#userDeleteBtn').forEach((el) => {
                    el.addEventListener('click', () => {
                        el.closest('#popupBg').remove();

                        if (user.emailVerified) { // 이메일 인증한 유저는 본인확인 처리 과정을 패스함 (boolean 값)

                            // dbFireStore().collection('users').get().then((result) => {
                            //     result.forEach((docList) => {
                            //         let docListDataTest = docList.data();
                            //         console.log(docListDataTest);
                            //         console.log(docList);
                            //
                            //         if (docList.id === docListDataTest.id) {
                            //             console.log("aaa");
                            //             console.log(docList.id);
                            //             dbFireStore().collection('users').doc(docList.id).delete().then(() => {
                            //                 console.log("bbb");
                            //             }).catch((error) => {
                            //                 console.log(error);
                            //             });
                            //         }
                            //     });
                            // });

                            user.delete().then(() => {
                                windowPopup('회원 탈퇴처리가 정상적으로 완료되었습니다.<br>이용해주셔서 감사합니다 :)');

                                document.querySelector('#windowPopupOk').addEventListener('click', () => {
                                    reload();
                                });
                            }).catch((error) => {
                                windowPopup('회원 탈퇴처리가 실패하였습니다, 잠시 후 다시 시도해주세요.<br>' + error.message);
                            });
                        }
                    });
                });
            });

            document.querySelector('.user-modify').addEventListener('click', () => { // 정보 수정
                modal(
            '회원 정보를 수정해주세요 :)',
        '<div class="user-info-modify">' +
                    '<label for="">이름</label>' +
                    '<input type="text" name="name" value="'+ user.displayName + '" autocomplete="off" disabled="disabled" />' +
                    '<label for="">이메일</label>' +
                    '<input type="text" name="email" value="'+ user.email +'" autocomplete="off" disabled="disabled" placeholder="이메일을(를) 입력해주세요." />' +
                    '<label for="">비밀번호</label>' +
                    '<input type="password" name="password" value="" autocomplete="off" placeholder="비밀번호을(를) 입력해주세요." />' +
                    '<label for="">비밀번호 확인</label>' +
                    '<input type="password" name="re_password" value="" autocomplete="off" placeholder="비밀번호을(를) 한번 더 입력해주세요." />' +
                    '<button class="modal-btn-type-1" type="button" onclick="signInUp(this);">수정하기</button>' +
                '</div>',
                );
            });
        });

        document.querySelector('.user-name').addEventListener('mouseleave', () => { // 내 정보 박스 폼 삭제
            document.querySelector('.my-info-box').remove();
        });

        /**
         * logout
         */
        signInOutBtn.textContent = 'sign out';
        signInOutBtn.addEventListener('click', () => {
            dbAuth().signOut();
            windowPopup('로그아웃 되었습니다.');

            document.querySelector('#windowPopupOk').addEventListener('click', () => {
                reload();
            });
        });
    } else {
        console.log("로그인 상태가 아닙니다.");

        nameView.innerHTML = '<span>GUEST</span> 님, 환영합니다 :)';

        signInOutBtn.addEventListener('click', () => {
            modal(
        '로그인을 해주세요 :)',
    '<div class="switch-mode sign-auth-wrap">' +
                '<div class="sign-in-box">' +
                    '<div class="email-auth-box">' +
                        '<input type="text" name="email" value="" autocomplete="off" placeholder="이메일을(를) 입력해주세요." />' +
                    '</div>' +
                    '<input type="password" name="password" value="" autocomplete="off" placeholder="비밀번호을(를) 입력해주세요." />' +
                    '<button class="sign-btn modal-btn-type-1" type="button" onclick="signInUp(this);">로그인하기</button>' +
                '</div>' +
                '<div class="sns-sign-in-box">' +
                    '<hr>' +
                    '<div class="sns-sign-in-info-wrap">' +
                        '<button class="sns-sign-in-info" type="button" onclick="signInUp(this);">' +
                            '<img src="./images/sns/google_icon.png" title="구글 이메일로 로그인" alt="구글 이메일로 로그인" />' +
                            '<span>google</span>' +
                        '</button>' +
                        '<button class="sns-sign-in-info" type="button" onclick="signInUp(this);">' +
                            '<img src="./images/sns/facebook_icon.png" title="페이스북 이메일로 로그인" alt="페이스북 이메일로 로그인" />' +
                            '<span>facebook</span>' +
                        '</button>' +
                        '<button class="sns-sign-in-info" type="button" onclick="signInUp(this);">' +
                            '<img src="./images/sns/kakao_icon.png" title="카카오 이메일로 로그인" alt="카카오 이메일로 로그인" />' +
                            '<span>kakao</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="sign-info-box">' +
                    '<div class="sign-info qa-member">' +
                        '<p>아직 회원이 아니신가요?</p>' +
                        '<button type="button" onclick="signUp(this);">일반 회원가입</button>' +
                    '</div>' +
                    '<div class="sign-info qa-password-find">' +
                        '<p>비밀번호를 잊어버리셨나요?</p>' +
                        '<button type="button" onclick="passwordReset();">재설정</button>' +
                    '</div>' +
                '</div>' +
            '</div>',
            );
        });
    }
});

/**
 * portfolio sites list view
 */
let limit = 4; // 처음 화면에 보여줄 게시물 갯수
let moreViewTempleat = '<button id="moreViewBtn" class="btn-type-2 more-view" type="button">' + 'more view' + '</button>';
let siteNoListTempleat = '<div>게시물이 없습니다.</div>';

dbFireStore().collection('site').where('categoriesInfo.categories', '==', '호텔/팬션').get().then((result) => {
    result.forEach((docList) => {
        let docListData = docList.data();

        const siteListTempleat = '' +
            '<div id="'+ docList.id +'" class="site-list-box">' +
                '<img class="thumbnail" src="' + docListData.thumbnailUrl + '" title="' + docListData.title + '" />' +
            '</div>';

        document.querySelector('#hotelList').innerHTML += siteListTempleat;
    });

    let siteListBox = document.querySelectorAll('#hotelList .site-list-box');
    let siteListBoxThumbnail = document.querySelectorAll('#hotelList .site-list-box .thumbnail');
    let siteListBoxLength = siteListBox.length;

    if (result.size === 0) { // 총 게시물이 1개도 없을때
        document.querySelector('#hotelList').innerHTML = siteNoListTempleat;
    } else if (result.size > 4) { // 총 게시물이 4개이상일때
        document.querySelector('#hotelList').insertAdjacentHTML('afterend', moreViewTempleat);
    } else if (result.size === 1) {
        siteListBox[0].style.cssText = `width: 530px;`;
        siteListBoxThumbnail[0].style.cssText = `width: auto; height: auto; box-shadow: rgb(0 0 0 / 30%) 20px 20px 12px 0px;`;
    }

    if (siteListBoxLength > limit) {
        for (let i = limit; i < siteListBoxLength; i += 1) {
            siteListBox[i].classList.add('hidden');
        }
    }

    let moreViewBtn = document.querySelector('#hotel #moreViewBtn');
    let limitAdd = 4; // 더보기 시 보여줄 게시물 갯수

    moreViewBtn.addEventListener('click', () => { // 더보기
        let siteListBoxHidden = document.querySelectorAll('#hotelList .site-list-box.hidden');

        if (siteListBoxHidden.length < limitAdd) {
            limitAdd = siteListBoxHidden.length;
        }

        for (let i = 0; i < limitAdd; i += 1) {
            siteListBoxHidden[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('#hotelList .site-list-box.hidden').length === 0) {
            moreViewBtn.style.display = 'none';
        }
    });
});

dbFireStore().collection('site').where('categoriesInfo.categories', '==', '쇼핑몰').get().then((result) => {
    result.forEach((docList) => {
        let docListData = docList.data();

        const siteListTempleat = '' +
            '<div id="'+ docList.id +'" class="site-list-box">' +
                '<img class="thumbnail" src="' + docListData.thumbnailUrl + '" title="' + docListData.title + '" />' +
            '</div>';

        document.querySelector('#shoppingMallList').innerHTML += siteListTempleat; // 게시물 생성
    });

    let siteListBox = document.querySelectorAll('#shoppingMallList .site-list-box');
    let siteListBoxThumbnail = document.querySelectorAll('#shoppingMallList .site-list-box .thumbnail');
    let siteListBoxLength = siteListBox.length;

    if (result.size === 0) { // 총 게시물이 1개도 없을때
        document.querySelector('#shoppingMallList').innerHTML = siteNoListTempleat;
    } else if (result.size > 4) { // 총 게시물이 4개이상일때
        document.querySelector('#shoppingMallList').insertAdjacentHTML('afterend', moreViewTempleat);
    } else if (result.size === 1) {
        siteListBox[0].style.cssText = `width: 530px;`;
        siteListBoxThumbnail[0].style.cssText = `width: auto; height: auto; box-shadow: rgb(0 0 0 / 30%) 20px 20px 12px 0px;`;
    }

    if (siteListBoxLength > limit) {
        for (let i = limit; i < siteListBoxLength; i += 1) {
            siteListBox[i].classList.add('hidden');
        }
    }

    let moreViewBtn = document.querySelector('#shoppingMall #moreViewBtn');
    let limitAdd = 4; // 더보기 시 보여줄 게시물 갯수

    moreViewBtn.addEventListener('click', () => { // 더보기
        let siteListBoxHidden = document.querySelectorAll('#shoppingMallList .site-list-box.hidden');

        if (siteListBoxHidden.length < limitAdd) {
            limitAdd = siteListBoxHidden.length;
        }

        for (let i = 0; i < limitAdd; i += 1) {
            siteListBoxHidden[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('#shoppingMallList .site-list-box.hidden').length === 0) {
            moreViewBtn.style.display = 'none';
        }
    });
});

dbFireStore().collection('site').where('categoriesInfo.categories', '==', '교육/IT솔루션').get().then((result) => {
    result.forEach((docList) => {
        let docListData = docList.data();

        const siteListTempleat = '' +
            '<div id="'+ docList.id +'" class="site-list-box">' +
                '<img class="thumbnail" src="' + docListData.thumbnailUrl + '" title="' + docListData.title + '" />' +
            '</div>';

        document.querySelector('#solutionServiceList').innerHTML += siteListTempleat;
    });

    let siteListBox = document.querySelectorAll('#solutionServiceList .site-list-box');
    let siteListBoxThumbnail = document.querySelectorAll('#solutionServiceList .site-list-box .thumbnail');
    let siteListBoxLength = siteListBox.length;

    if (result.size === 0) { // 총 게시물이 1개도 없을때
        document.querySelector('#solutionServiceList').innerHTML = siteNoListTempleat;
    } else if (result.size > 4) { // 총 게시물이 4개이상일때
        document.querySelector('#solutionServiceList').insertAdjacentHTML('afterend', moreViewTempleat);
    } else if (result.size === 1) {
        siteListBox[0].style.cssText = `width: 530px;`;
        siteListBoxThumbnail[0].style.cssText = `width: auto; height: auto; box-shadow: rgb(0 0 0 / 30%) 20px 20px 12px 0px;`;
    }

    if (siteListBoxLength > limit) {
        for (let i = limit; i < siteListBoxLength; i += 1) {
            siteListBox[i].classList.add('hidden');
        }
    }

    let moreViewBtn = document.querySelector('#solutionService #moreViewBtn');
    let limitAdd = 4; // 더보기 시 보여줄 게시물 갯수

    moreViewBtn.addEventListener('click', () => { // 더보기
        let siteListBoxHidden = document.querySelectorAll('#solutionServiceList .site-list-box.hidden');

        if (siteListBoxHidden.length < limitAdd) {
            limitAdd = siteListBoxHidden.length;
        }

        for (let i = 0; i < limitAdd; i += 1) {
            siteListBoxHidden[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('#solutionServiceList .site-list-box.hidden').length === 0) {
            moreViewBtn.style.display = 'none';
        }
    });
});

dbFireStore().collection('site').where('categoriesInfo.categories', '==', '제조장비 반도체산업').get().then((result) => {
    result.forEach((docList) => {
        let docListData = docList.data();

        const siteListTempleat = '' +
            '<div id="'+ docList.id +'" class="site-list-box">' +
                '<img class="thumbnail" src="' + docListData.thumbnailUrl + '" title="' + docListData.title + '" />' +
            '</div>';

        document.querySelector('#semiconductorList').innerHTML += siteListTempleat;
    });

    let siteListBox = document.querySelectorAll('#semiconductorList .site-list-box');
    let siteListBoxThumbnail = document.querySelectorAll('#semiconductorList .site-list-box .thumbnail');
    let siteListBoxLength = siteListBox.length;

    if (result.size === 0) { // 총 게시물이 1개도 없을때
        document.querySelector('#semiconductorList').innerHTML = siteNoListTempleat;
    } else if (result.size > 4) { // 총 게시물이 4개이상일때
        document.querySelector('#semiconductorList').insertAdjacentHTML('afterend', moreViewTempleat);
    } else if (result.size === 1) {
        siteListBox[0].style.cssText = `width: 530px;`;
        siteListBoxThumbnail[0].style.cssText = `width: auto; height: auto; box-shadow: rgb(0 0 0 / 30%) 20px 20px 12px 0px;`;
    }

    if (siteListBoxLength > limit) {
        for (let i = limit; i < siteListBoxLength; i += 1) {
            siteListBox[i].classList.add('hidden');
        }
    }

    let moreViewBtn = document.querySelector('#semiconductor #moreViewBtn');
    let limitAdd = 4; // 더보기 시 보여줄 게시물 갯수

    moreViewBtn.addEventListener('click', () => { // 더보기
        let siteListBoxHidden = document.querySelectorAll('#semiconductorList .site-list-box.hidden');

        if (siteListBoxHidden.length < limitAdd) {
            limitAdd = siteListBoxHidden.length;
        }

        for (let i = 0; i < limitAdd; i += 1) {
            siteListBoxHidden[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('#semiconductorList .site-list-box.hidden').length === 0) {
            moreViewBtn.style.display = 'none';
        }
    });
});

dbFireStore().collection('site').where('categoriesInfo.categories', '==', '기타').get().then((result) => {
    result.forEach((docList) => {
        let docListData = docList.data();

        const siteListTempleat = '' +
            '<div id="'+ docList.id +'" class="site-list-box">' +
                '<img class="thumbnail" src="' + docListData.thumbnailUrl + '" title="' + docListData.title + '" />' +
            '</div>';

        document.querySelector('#etcList').innerHTML += siteListTempleat;
    });

    let siteListBox = document.querySelectorAll('#etcList .site-list-box');
    let siteListBoxThumbnail = document.querySelectorAll('#etcList .site-list-box .thumbnail');
    let siteListBoxLength = siteListBox.length;

    if (result.size === 0) { // 총 게시물이 1개도 없을때
        document.querySelector('#etcList').innerHTML = siteNoListTempleat;
    } else if (result.size > 4) { // 총 게시물이 4개이상일때
        document.querySelector('#etcList').insertAdjacentHTML('afterend', moreViewTempleat);
    } else if (result.size === 1) {
        siteListBox[0].style.cssText = `width: 530px;`;
        siteListBoxThumbnail[0].style.cssText = `width: auto; height: auto; box-shadow: rgb(0 0 0 / 30%) 20px 20px 12px 0px;`;
    }

    if (siteListBoxLength > limit) {
        for (let i = limit; i < siteListBoxLength; i += 1) {
            siteListBox[i].classList.add('hidden');
        }
    }

    let moreViewBtn = document.querySelector('#etc #moreViewBtn');
    let limitAdd = 4; // 더보기 시 보여줄 게시물 갯수

    moreViewBtn.addEventListener('click', () => { // 더보기
        let siteListBoxHidden = document.querySelectorAll('#etcList .site-list-box.hidden');

        if (siteListBoxHidden.length < limitAdd) {
            limitAdd = siteListBoxHidden.length;
        }

        for (let i = 0; i < limitAdd; i += 1) {
            siteListBoxHidden[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('#etcList .site-list-box.hidden').length === 0) {
            moreViewBtn.style.display = 'none';
        }
    });
});

/**
 * portfolio sites write
 *
 */
document.querySelector('#portfolioSiteWriteBtn').addEventListener('click', () => {
    portfolioSite();
    calendarChange('start', 'end');
    siteCategoriesChange();
    siteTypeChange();
    fileChange();

    document.querySelector('#writeBtn').addEventListener('click', () => { // 포트폴리오 사이트 글 등록
        if (isSuperAdmin) {
            if (startPeriodData !== undefined && endPeriodData !== undefined && siteCategoriesData !== undefined && siteTypeData !== undefined && siteName.value !== '' && siteDescription.value !== '' && siteLink.value !== '' && fileUpload !== undefined) {
                let calendarJSON = {
                    startPeriod: startPeriodData,
                    endPeriod: endPeriodData,
                }

                let categoriesJSON = {
                    categories: siteCategoriesData,
                    selected: isCategories,
                };

                let typeJSON = {
                    type: siteTypeData,
                    selected: isType,
                };

                let dataSave = {
                    projectPeriod: calendarJSON, // 시작 & 종료 기간
                    categoriesInfo: categoriesJSON, // 분류 & 선택 여부
                    typeInfo: typeJSON, // 유형 & 선택 여부
                    title: siteName.value, // 이름
                    description: siteDescription.value.replace(/(?:\r\n|\r|\n)/g, '<br />'), // 설명
                    link: siteLink.value, // 주소
                    thumbnailUrl: siteThumbnailUrl, // 썸네일 이미지 경로
                };

                dbFireStore().collection('site').add(dataSave).then(() => {
                    windowPopup('정상적으로 등록 되었습니다.');

                    document.querySelector('#windowPopupOk').addEventListener('click', () => {
                        reload();
                    });
                }).catch((error) => {
                    windowPopup('등록에 실패하였습니다, 잠시 후 다시 시도해주세요.<br>' + error.message);
                });
            } else {
                windowPopup('모든 항목에 선택/입력 해주세요.');
            }
        } else {
            windowPopup('권한이 없습니다.<br>시스템 관리자에게 문의바랍니다.');
        }
    });
});

const getSiteListDetail = () => { // 등록한 포트폴리오 사이트 글 전체 불러오기
    dbFireStore().collection('site').get().then((result) => {
        result.forEach((docList) => {
            let docListData = docList.data();
            let isDescription;

            if (isDescription === undefined) {
                isDescription = docListData.description;
            }

            window.addEventListener('resize', () => {
                if (matchMedia('screen and (min-width: 940px) and (max-width: 1120px)').matches) {
                    isDescription = '지원하지 않는 해상도이며 원문 설명글을 보실 수 없습니다.';
                } else {
                    isDescription = docListData.description;
                }
            });

            // settimeout 임시로.. 추후에 변경해야함
            setTimeout(() => {
                const siteDetailViewTempleat = '' +
                    '<div class="site-detail-view site-detail-view-'+ docList.id +'">' +
                        '<div class="btn-wrap">' +
                            '<button id="modifyBtn" class="icon-btn" data-id="'+ docList.id +'" type="button">' +
                                '<img src="./images/edit.png" title="수정하기" />' +
                            '</button>' +
                            '<button id="deleteBtn" class="icon-btn" data-id="'+ docList.id +'" type="button">' +
                                '<img src="./images/trash.png" title="삭제하기" />' +
                            '</button>' +
                        '</div>' +
                        '<span class="site-detail-view-type">' + docListData.typeInfo['type'] + '</span>' +
                        '<h3 class="site-detail-view-title">' + docListData.title + '</h3>' +
                        '<span class="site-detail-view-period">' + '(' + docListData.projectPeriod['startPeriod'] + ' ~ ' + docListData.projectPeriod['endPeriod'] + ')' + '</span>' +
                        '<p class="site-detail-view-description"></p>' +
                        '<a class="site-detail-view-link" href="' + docListData.link + '" target="_blank">' +
                            'site link' +
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path class="fill" d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="#ffffff"/></svg>' +
                        '</a>' +
                    '</div>';

                // querySelector는 인자값으로 숫자를 받지못해서 id를 지정했을때 고유의 값이라 숫자를 인식 못하여 getElementById 함수로 사용
                // 예) id="5RLvZOBC1iPl3UEO0nwD"
                let docListID = document.getElementById(''+ docList.id +'')

                // siteListTempleat 변수에 정의한 html의 doc.id(문서의 고유id)값을 가져와서 매치하여 실행
                docListID.addEventListener('mouseenter', () => {
                    document.getElementById(''+ docList.id +'').insertAdjacentHTML('afterbegin', siteDetailViewTempleat);

                    document.querySelector('.site-detail-view-description').innerHTML += isDescription;

                    document.querySelector('.site-detail-view').animate([
                        // from keyframe
                        {
                            opacity: 0,
                        },
                        // to keyframe
                        {
                            opacity: 1,
                        }
                    ], 130);

                    let siteDetailViewLink = document.querySelector('.site-detail-view .site-detail-view-link');

                    siteDetailViewLink.addEventListener('mouseenter', (e) => {
                        let targetViewLink = e.target;

                        targetViewLink.classList.add('active');
                        targetViewLink.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path class="fill" d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="#000000"/></svg>';
                    });
                    siteDetailViewLink.addEventListener('mouseleave', (e) => {
                        let targetViewLink = e.target;

                        targetViewLink.classList.remove('active');
                        targetViewLink.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path class="fill" d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="#ffffff"/></svg>';
                    });

                    /**
                     * portfolio sites write update
                     */
                    document.querySelectorAll('#modifyBtn').forEach((el) => {
                        el.addEventListener('click', () => {
                            // if (isUser) {
                            portfolioSite();
                            calendarChange('start', 'end');
                            siteCategoriesChange();
                            siteTypeChange();
                            fileChange();

                            document.querySelector('#writeBtn').id = 'writeModifyBtn';
                            document.querySelector('.modal-title h2').textContent = '등록한 프로젝트를 수정 해보세요 :)';
                            document.querySelector('#writeModifyBtn').textContent = '수정하기';
                            document.querySelector('#writeModifyBtn').dataset.id = el.getAttribute('data-id');

                            document.querySelector('#startPeriod').value = docListData.projectPeriod['startPeriod'];
                            document.querySelector('#endPeriod').value = docListData.projectPeriod['endPeriod'];
                            document.querySelector('#siteName').value = docListData.title;
                            document.querySelector('#siteDescription').value = docListData.description;
                            document.querySelector('#siteLink').value = docListData.link;
                            document.querySelector('.file-name').value = docListData.thumbnailUrl;

                            if (docListData.projectPeriod['startPeriod'] !== undefined && docListData.projectPeriod['endPeriod'] !== undefined) { // 수정을 안했을때 undefined 이므로 이전의 기존 데이터를 저장
                                startPeriodData = docListData.projectPeriod['startPeriod'];
                                endPeriodData = docListData.projectPeriod['endPeriod'];
                            }

                            if (docListData.categoriesInfo['selected'] === true) { // 분류 선택 후 등록 시 selected 가 true일때 다시 불러오기 위함
                                let siteCategoriesDefalut = document.querySelector('#siteCategories');

                                for (let i = 0; i < siteCategoriesDefalut.length; i += 1) {
                                    // console.log(siteCategoriesDefalut.options[i]);
                                    siteCategoriesDefalut[i].removeAttribute('selected');

                                    for (let j = 0; j < siteCategoriesDefalut.length; j += 1) {
                                        if (siteCategoriesDefalut.options[j].value === docListData.categoriesInfo['categories']) {
                                            siteCategoriesDefalut.options[j].setAttribute('selected', 'selected');
                                            siteCategoriesData = siteCategoriesDefalut.options[j].value; // 수정을 안했을때 undefined 이므로 이전의 기존 데이터를 저장
                                            isCategories = docListData.categoriesInfo['selected']; // 수정을 안했을때 undefined 이므로 이전의 기존 데이터를 저장
                                        }
                                    }
                                }
                            }

                            if (docListData.typeInfo['selected'] === true) { // 유형 선택 후 등록 시 selected 가 true일때 다시 불러오기 위함
                                let siteTypeDefalut = document.querySelector('#siteType');

                                for (let i = 0; i < siteTypeDefalut.length; i += 1) {
                                    // console.log(siteTypeDefalut.options[i]);
                                    siteTypeDefalut[i].removeAttribute('selected');

                                    for (let j = 0; j < siteTypeDefalut.length; j += 1) {
                                        if (siteTypeDefalut.options[j].value === docListData.typeInfo['type']) {
                                            siteTypeDefalut.options[j].setAttribute('selected', 'selected');
                                            siteTypeData = siteTypeDefalut.options[j].value; // 수정을 안했을때 undefined 이므로 이전의 기존 데이터를 저장
                                            isType = docListData.typeInfo['selected']; // 수정을 안했을때 undefined 이므로 이전의 기존 데이터를 저장
                                        }
                                    }
                                }
                            }

                            document.querySelectorAll('#writeModifyBtn').forEach((el) => {
                                el.addEventListener('click', (e) => { // 포트폴리오 사이트 글 수정
                                    if (isSuperAdmin) {
                                        let calendarJSON = {
                                            startPeriod: startPeriodData,
                                            endPeriod: endPeriodData,
                                        }

                                        let categoriesJSON = {
                                            categories: siteCategoriesData,
                                            selected: isCategories,
                                        };

                                        let typeJSON = {
                                            type: siteTypeData,
                                            selected: isType,
                                        };

                                        let dataUpdateSave = {
                                            projectPeriod: calendarJSON, // 시작 & 종료 기간
                                            categoriesInfo: categoriesJSON, // 분류 & 선택 여부
                                            typeInfo: typeJSON, // 유형 & 선택 여부
                                            title: siteName.value, // 이름
                                            description: siteDescription.value.replace(/(?:\r\n|\r|\n)/g, '<br />'), // 설명
                                            link: siteLink.value, // 주소
                                            thumbnailUrl: (siteThumbnailUrl !== '') ? siteThumbnailUrl : document.querySelector('.file-name').value, // 썸네일 이미지 경로
                                        };

                                        dbFireStore().collection('site').doc(e.target.dataset.id).update(dataUpdateSave).then(() => {
                                            windowPopup('게시물이 수정되었습니다.');

                                            document.querySelector('#windowPopupOk').addEventListener('click', () => {
                                                reload();
                                            });
                                        }).catch((error) => {
                                            windowPopup('게시물 수정 중 오류가 발생했습니다, 잠시 후 다시 시도해주세요.<br>' + error.message);
                                        });
                                    } else {
                                        windowPopup('권한이 없습니다.<br>시스템 관리자에게 문의바랍니다.');
                                    }
                                });
                            });
                            // } else {
                            //     windowPopup('회원이 아니시라면 회원 가입 후 이용 해주세요.');
                            // }
                        });
                    });

                    /**
                     * portfolio sites write delete
                     */
                    document.querySelectorAll('#deleteBtn').forEach((el) => {
                        el.addEventListener('click', () => {
                            // if (isUser) {
                            windowPopup('"' + docListData.title + '" 게시물을 삭제하시겠습니까?<br>한번 삭제를하면 복구가 불가능합니다.', '<button id="windowPopupCancel" class="bg-danger" type="button">취소</button>');
                            document.querySelector('#windowPopupOk').id = 'writeDeleteBtn';
                            document.querySelector('#writeDeleteBtn').dataset.id = el.getAttribute('data-id');
                            document.querySelectorAll('#writeDeleteBtn').forEach((el) => {
                                el.addEventListener('click', (e) => { // 포트폴리오 사이트 글 삭제
                                    el.closest('#popupBg').remove();

                                    if (isSuperAdmin) {
                                        dbFireStore().collection('site').doc(e.target.dataset.id).delete().then(() => {
                                            windowPopup('게시물이 삭제되었습니다.');

                                            document.querySelector('#windowPopupOk').addEventListener('click', () => {
                                                reload();
                                            });
                                        }).catch((error) => {
                                            windowPopup('게시물 삭제 중 오류가 발생했습니다, 잠시 후 다시 시도해주세요.<br>' + error.message);
                                        });
                                    } else {
                                        windowPopup('권한이 없습니다.<br>시스템 관리자에게 문의바랍니다.');
                                    }
                                });
                            });
                            // } else {
                            //     windowPopup('회원이 아니시라면 회원 가입 후 이용 해주세요.');
                            // }
                        });
                    });
                });

                // 상단에 siteDetailViewTempleat 변수에 정의한 html의 site-detail-view-'+doc.id' 매치하여 이벤트 실행
                docListID.addEventListener('mouseleave', () => {
                    document.querySelector('.site-detail-view-'+docList.id).remove();
                });
            }, 500);
        });
    });
}
getSiteListDetail();

function signUp(self) {
    self.closest('.sign-auth-wrap').classList.toggle('switch-mode');
    document.querySelectorAll('input').forEach((el, i) => {
        el.value = '';
    });

    if (self.closest('.sign-auth-wrap').classList.contains('switch-mode')) { // 로그인 하기
        self.closest('.sign-auth-wrap .sign-info button').textContent = '일반 회원가입';
        document.querySelector('.modal-title h2').textContent = '로그인을 해주세요 :)';
        document.querySelector('.qa-member p').textContent = '아직 회원이 아니신가요?';
        document.querySelector('.sign-up-box').className = 'sign-in-box';
        document.querySelector('.sign-in-box .sign-btn').textContent = '로그인하기';
        document.querySelector('input[name=name]').remove();
        document.querySelector('.input-wrap').remove();
        document.querySelector('.eyes').remove();
        document.querySelector('.sns-sign-in-box').style.display = 'block';
        document.querySelector('.qa-password-find').style.display = 'flex';
        // document.querySelector('.email-certification-btn').remove();
    } else if (!self.closest('.sign-auth-wrap').classList.contains('switch-mode')) { // 회원 가입 하기
        self.closest('.sign-auth-wrap button').textContent = '로그인';
        document.querySelector('.modal-title h2').textContent = '회원가입을 해주세요 :)';
        document.querySelector('.qa-member p').textContent = '계정이 이미 있으신가요?';
        document.querySelector('.sign-in-box').className = 'sign-up-box';
        document.querySelector('.sign-up-box .sign-btn').textContent = '가입하기';
        document.querySelector('.sns-sign-in-box').style.display = 'none';
        document.querySelector('.qa-password-find').style.display = 'none';

        let inputNameHtml = '<input type="text" name="name" value="" autocomplete="off" placeholder="반드시 실명을(를) 입력해주세요." />';
        // let emailCertificationHtml = '<button id="emailCertificationBtn" class="email-certification-btn modal-btn-type-2" type="button">인증하기</button>';
        let inputPasswordHtml = '' +
            '<div class="input-wrap">' +
                '<input type="password" name="re_password" value="" autocomplete="off" placeholder="비밀번호을(를) 한번 더 입력해주세요." />' +
                '<img class="eyes" src="./images/eyes_on.png" alt="" />' +
            '</div>';

        document.querySelector('.sign-up-box .email-auth-box').insertAdjacentHTML('beforebegin', inputNameHtml);
        // document.querySelector('.sign-up-box input[name=email]').insertAdjacentHTML('afterend', emailCertificationHtml);
        document.querySelector('.sign-up-box input[name=password]').insertAdjacentHTML('afterend', inputPasswordHtml);
        document.querySelector('.sign-up-box input[name=password]').insertAdjacentHTML('afterend', '<img class="eyes" src="./images/eyes_on.png" alt="" />');

        // document.querySelector('#emailCertificationBtn').addEventListener('click', () => { // 이메일 인증하기
        //     if (!document.querySelector('input[name=email]').value) {
        //         windowPopup('이메일을(를) 입력해주세요.');
        //     } else if (!emailCheck(document.querySelector('input[name=email]').value)) {
        //         windowPopup('이메일 형식이 올바르지 않습니다.');
        //     } else {
        //         var actionCodeSettings = {
        //             url: 'http://localhost:9000/',
        //             handleCodeInApp: true,
        //         };
        //         dbAuth().sendSignInLinkToEmail(document.querySelector('input[name=email]').value, actionCodeSettings).then(() => {
        //             window.localStorage.setItem('emailForSignIn', document.querySelector('input[name=email]').value);
        //         }).catch((error) => {
        //             alert(error.message);
        //         });
        //     }
        // });

        document.querySelectorAll('.eyes').forEach((el, i) => {
            el.addEventListener('click', () =>  {
                let togglePassword = document.querySelectorAll('input[name=password], input[name=re_password]');

                togglePassword.forEach((item) => {
                    item.classList.toggle('active');

                    document.querySelectorAll('.eyes').forEach((el) => {
                        if (item.classList.contains('active') === true) {
                            item.setAttribute('type', 'text');
                            el.src = './images/eyes_off.png';
                        } else {
                            item.setAttribute('type', 'password');
                            el.src = './images/eyes_on.png';
                        }
                    });
                });
            });
        });
    }
}

function signInUp(self) {
    let userEmail = document.querySelector('input[name=email]').value;
    let userPassword = (!!document.querySelector('input[name=password]') !== false) ? document.querySelector('input[name=password]').value : '';
    let user_rePassword = (!!document.querySelector('input[name=re_password]') !== false) ? document.querySelector('input[name=re_password]').value : '';

    if (self.textContent === '로그인하기') {
        if (!userEmail) {
            windowPopup('이메일을(를) 입력해주세요.');
            return;
        } else if (!emailCheck(userEmail)) {
            windowPopup('이메일 형식이 올바르지 않습니다.');
            return;
        } else if (!userPassword) {
            windowPopup('비밀번호을(를) 입력해주세요.');
            return;
        }

        dbAuth().signInWithEmailAndPassword(userEmail, userPassword).then(result => { // 로그인
            if (result.user.emailVerified) { // 이메일 인증한 유저만 로그인 가능 (boolean 값)
                reload();
            } else {
                windowPopup('이메일 인증이 확인되지 않았습니다.<br>인증 메일의 링크를 다시 전송하시겠습니까?');

                document.querySelector('#windowPopupOk').addEventListener('click', () => {
                    dbAuth().currentUser?.sendEmailVerification();
                    windowPopup(result.user.email+' 이메일로 전송된 인증 메일의 링크를 클릭하여 인증을 완료해주세요.<br>인증 후 로그인이 가능합니다.');
                    dbAuth().signOut();

                    document.querySelector('#windowPopupOk').id = 'emailCertificationReSend';
                    document.querySelectorAll('#emailCertificationReSend').forEach((el) => {
                        el.addEventListener('click', () => {
                            el.closest('#popupBg').remove();
                            reload();
                        });
                    });
                });
            }
        }).catch(error => {
            windowPopup('아이디 또는 비밀번호가 일치하지 않습니다.<br>회원이 아니시라면 회원 가입 후 이용해주세요.');
        });
    } else if (self.textContent === 'google') {
        dbAuth().signInWithRedirect(googleProvider); // 페이지 전환되어 인증 절차 진행
        // dbAuth().getRedirectResult().then((result) => { // 인증 절차 진행 전 페이지가 로드될때 OAuth 토큰 정보를 가져와서 볼 수 있음
        //     alert(JSON.stringify(result));
        // }).catch((error) => {
        //     windowPopup('잠시 후 다시 시도해주세요.'+error.message);
        // });
    } else if (self.textContent === 'facebook') {
        dbAuth().signInWithRedirect(facebookProvider);
    } else if (self.textContent === 'kakao') {
        window.Kakao.Auth.authorize();

        // const kakaoHeader = {
        //     'Authorization': '130ea37cbaa01dd162b7a2eb96b96e44',
        //     'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        // };
        // const getKakaoToken = async (code) => {
        //     console.log('loginWithKakao');
        //     try {
        //         const data = {
        //             grant_type: 'authorization_code',
        //             client_id: '34d1864b0ed999a00aff11abe41e89b5',
        //             redirect_uri: 'http://localhost:9000/auth',
        //             code: code,
        //         };
        //         const queryString = Object.keys(data)
        //             .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
        //             .join('&');
        //         const result = await axios.post('https://kauth.kakao.com/oauth/token', queryString, { headers: kakaoHeader });
        //         console.log('카카오 토큰', result);
        //         return result;
        //     } catch (e) {
        //         return e;
        //     }
        // };
        // getKakaoToken();
    } else if (self.textContent === '수정하기') {
        dbAuth().currentUser.updatePassword(userPassword).then(() => {
            windowPopup('정상적으로 회원 정보가 수정 되었습니다.');
            document.querySelector('#windowPopupOk').addEventListener('click', () => {
                reload();
            });
        }).catch(error => {
            console.log(error.message);

            if (error.message === 'Password should be at least 6 characters') {
                windowPopup('비밀번호는 6자 이상이어야 합니다.');
                return;
            }

            if (!userPassword || !user_rePassword) {
                windowPopup('비밀번호을(를) 입력해주세요.');
                return;
            } else if (userPassword !== user_rePassword) {
                windowPopup('비밀번호가 일치하지 않습니다.');
                return;
            }

            windowPopup('회원 정보 수정에 실패하였습니다, 잠시 후 다시 시도해주세요.');
        });
    } else if (self.textContent === '가입하기') {
        let userName = document.querySelector('input[name=name]').value;

        if (!userName) {
            windowPopup('이름을(를) 입력해주세요.');
            return;
        } else if (!userEmail) {
            windowPopup('이메일을(를) 입력해주세요.');
            return;
        } else if (!emailCheck(userEmail)) {
            windowPopup('이메일 형식이 올바르지 않습니다.');
            return;
        } else if (!userPassword || !user_rePassword) {
            windowPopup('비밀번호을(를) 입력해주세요.');
            return;
        } else if (userPassword !== user_rePassword) {
            windowPopup('비밀번호가 일치하지 않습니다.');
            return;
        }

        dbAuth().createUserWithEmailAndPassword(userEmail, userPassword).then(result => { // 회원가입
            // let usersDataSave = {
            //     name: userName, // 이름
            //     email: userEmail, // 이메일
            // };
            // dbFireStore().collection('users').add(usersDataSave).then(() => {}) // 회원 가입 정보를 별도로 저장

            result.user.updateProfile({
                displayName: userName
            }).then(() => {
                dbAuth().currentUser?.sendEmailVerification();
                dbAuth().signOut(); // createUserWithEmailAndPassword 함수는 자동으로 로그인 되기때문에 메일 인증을 하기위해 로그아웃을 바로 실행

                windowPopup('본인확인을 위해서 가입하신 이메일로 전송된 인증 메일의 링크를 클릭하여 인증을 완료해주세요.<br>인증 후 로그인이 가능합니다.');
                document.querySelector('#windowPopupOk').addEventListener('click', () => {
                    reload();
                });
            });
        }).catch(error => {
            console.log(error.message);

            if (error.message === 'Password should be at least 6 characters') {
                windowPopup('비밀번호는 6자 이상이어야 합니다.');
                return;
            }

            if (error.message === 'The email address is already in use by another account.') {
                windowPopup('이미 사용 중인 이메일 주소입니다.');
                return;
            }

            windowPopup('회원가입에 실패하였습니다, 잠시 후 다시 시도해주세요.');
        });
    } else if (self.textContent === '보내기') {
        if (!emailCheck(userEmail)) {
            windowPopup('이메일 형식이 올바르지 않습니다.');
            return;
        } else {
            dbAuth().sendPasswordResetEmail(userEmail).then(() => { // 비밀번호 재설정
                windowPopup('해당 이메일로 링크를 전송하였습니다.<br>메일함을 확인해주세요.');
            }).catch(error => {
                windowPopup('잠시 후 다시 시도해주세요<br>' + error.message);
            });
        }
    }
}

function passwordReset() {
    document.querySelector('.sign-in-box').className = 'password-reset-box';
    document.querySelector('.modal-title h2').textContent = '이메일로 비밀번호 재설정 링크를 보내드려요 :)';
    document.querySelector('.sign-btn').textContent = '보내기';
    document.querySelector('.sns-sign-in-box').remove();
    document.querySelector('.sign-info-box').remove();
    document.querySelector('input[name=password]').remove();
    document.querySelector('input[name=email]').placeholder = '가입시 등록한 이메일을 입력해 주세요.';
    document.querySelector('input[name=email]').value = '';
}

/**
 * portfolio sites tab menu
 */
tabMenuCategories.forEach((el, i) => {
    el.addEventListener('click', (e) =>  {
        tabMenuCategories.forEach((el) => {
           el.classList.remove('active');
        });

        tabMenuContent.forEach((el) => {
            el.classList.remove('active');
        });

        tabMenuCategories[i].classList.add('active');
        tabMenuContent[i].classList.add('active');
   });
});

/**
 * use skills
 */
skillBox.forEach((el, i) => {
    // let dataSkill = skillBox[i].getAttribute('data-skill');
    let dataSkill = el.getAttribute('data-skill');
    let skillTempleat = '' +
        '<div class="skill-view skill-view-'+ i +'">' +
            '<span>' + (dataSkill !== null ? dataSkill : "no skill") + '</span>' +
        '</div>';

    el.addEventListener('mouseenter', () => {
        el.insertAdjacentHTML('afterbegin', skillTempleat);

        el.animate([
            // from keyframe
            {
                opacity: 0,
            },
            // to keyframe
            {
                opacity: 1,
            }
        ], 140);
    });

    el.addEventListener('mouseleave', () => {
        document.querySelector('.skill-view-'+i).remove();
    });
});

new Swiper('.swiper-tool-container.swiper-container', {
    slidesPerView: 5,
    spaceBetween: 10,

    scrollbar: {
        el: '.swiper-tool-container .swiper-scrollbar',
        draggable: true,
    },

    navigation: {
        nextEl: '.swiper-tool-container .swiper-button-next',
        prevEl: '.swiper-tool-container .swiper-button-prev',
    },

    breakpoints: {
        991: {
            slidesPerView: 3,
        },
        767: {
            slidesPerView: 2,
        },
        500: {
            slidesPerView: 1.1,
        },
    },
});

/**
 * top button
 */
document.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
        topBtn.classList.remove('opacity0');
    } else {
        topBtn.classList.add('opacity0');
    }

    // pageYOffset는 IE 및 모든 브라우저에서 지원하지만 scrollY는 IE에서는 지원을 안함
    if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight) {
        topBtn.classList.add('opacity0');
    }
});
topBtn.addEventListener('click', () => {
    document.body.scrollIntoView({
        behavior: 'smooth'
    });
});
// });
