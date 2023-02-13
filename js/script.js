// window.addEventListener('DOMContentLoaded', function() {

/**
 * firebase config variable
 */
const dbAuth = firebase.auth // 회원가입, 로그인, 로그아웃, 패스워드 재설정, 회원탈퇴
const dbFireStore = firebase.firestore // 게시물 등록, 수정, 삭제
const dbStorage = firebase.storage // 저장 공간
const dbStorageRef = dbStorage().ref()
const googleProvider = new dbAuth.GoogleAuthProvider() // 구글 간편 로그인 (https://console.cloud.google.com/ 개발자 사이트 등록)
const facebookProvider = new dbAuth.FacebookAuthProvider() // 페이스북 간편 로그인 (https://developers.facebook.com/ 개발자 사이트 등록)
const githubProvider = new dbAuth.GithubAuthProvider() // 깃허브 간편 로그인 (https://github.com/settings/ 개발자 사이트 등록)

/**
 * global variable
 */
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
let isSuperAdmin, isModalBg = false;
let fileUpload;
let siteCategoriesData, siteTypeData, siteName, siteDescription, siteLink, siteThumbnailUrl = '';

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
            '<div class="modal-select-box-wrap">' +
                '<select id="siteCategories" class="modal-select-box">' +
                    '<option value="" selected="selected" disabled>분류 선택</option>' +
                    '<option value="쇼핑몰">쇼핑몰</option>' +
                    '<option value="호텔/팬션">호텔/팬션</option>' +
                    '<option value="교육/IT솔루션 서비스">교육/IT솔루션 서비스</option>' +
                    '<option value="제조장비 반도체산업">제조장비 반도체산업</option>' +
                    '<option value="기타">기타</option>' +
                '</select>' +
                '<select id="siteType" class="modal-select-box">' +
                    '<option value="" selected="selected" disabled>유형 선택</option>' +
                    '<option value="WEB">WEB</option>' +
                    '<option value="WEB/APP">WEB/APP</option>' +
                '</select>' +
            '</div>' +
            // '<div>진행 기간 : </div>' +
            '<input id="siteName" type="text" value="" autocomplete="off" placeholder="사이트 이름을(를) 입력해주세요." />' +
            '<textarea id="siteDescription" class="modal-textarea" placeholder="간략한 설명을(를) 입력해주세요."></textarea>' +
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

const fileChange = () => { // 첨부파일 선택 함수
    let fileNameTarget = document.querySelector('.file-name');

    document.querySelector('#fileUploadFind').addEventListener('change', (e) => {
        if (window.FileReader) {
            let fileTarget = e.target.files[0]; // 파일 추출
            let fileName = e.target.files[0].name; // 파일명 추출

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

const siteCategoriesSelected = () => { // 포트폴리오 사이트 분류 선택
    let siteCategories = document.querySelectorAll('#siteCategories');

    siteCategories.forEach((el, i) => {
        el.addEventListener('change', () => {
            let categoriesSelectValue = el.options[el.selectedIndex].value;

            // siteCategories.forEach((el) => {
            //     el.options[i].removeAttribute('selected');
            // });
            // siteCategories[i].options[el.selectedIndex].setAttribute('selected', 'selected');

            siteCategoriesData = categoriesSelectValue
        });
    });
}

const siteTypeSelected = () => { // 포트폴리오 사이트 유형 선택
    let siteType = document.querySelectorAll('#siteType');

    siteType.forEach((el, i) => {
        el.addEventListener('change', () => {
            let typeSelectValue = el.options[el.selectedIndex].value;

            // siteType.forEach((el) => {
            //     el.options[i].removeAttribute('selected');
            // });
            // siteType[i].options[el.selectedIndex].setAttribute('selected', 'selected');

            siteTypeData = typeSelectValue
        });
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

    if (document.querySelector('.menu').classList.contains('active')) {
        document.querySelector('.menu').classList.remove('active');
        document.querySelector('.nav .menu').style.right = '-100%';
        setTimeout(() => { // menu style transition이 0.3초이므로 0.1초 빠르게 딜레이를 같게하기 위함
            document.querySelector('.header').style.height = 'unset';
        }, 200);
        document.querySelector('#mobileMenuBtn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z" fill="rgba(255,255,255,1)"/></svg>';
    } else {
        document.querySelector('.menu').classList.add('active');
        document.querySelector('.nav .menu').style.right = '0px';
        document.querySelector('.header').style.height = '100%';
        document.querySelector('#mobileMenuBtn').innerHTML = '<svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="rgba(255,255,255,1)"/></svg>';
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
            if (document.querySelector('.menu').classList.contains('active')) {
                document.querySelector('.nav .menu').style.right = '-100%';
                setTimeout(() => { // menu style transition이 0.3초이므로 0.1초 빠르게 딜레이를 같게하기 위함
                    document.querySelector('.header').style.height = 'unset';
                }, 200);
                document.querySelector('.menu').classList.remove('active');
                document.querySelector('#mobileMenuBtn').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z" fill="rgba(255,255,255,1)"/></svg>';
            } else {
                document.querySelector('#mobileMenuBtn').innerHTML = '<svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="rgba(255,255,255,1)"/></svg>';
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
                '<span class="user-delete">회원탈퇴</span>' +
            '</div>';

        document.querySelector('.user-name').addEventListener('mouseenter', () => { // 내 정보 박스 생성
            document.querySelector('.user-name').insertAdjacentHTML('beforeend', myInfoBox);

            document.querySelector('.user-delete').addEventListener('click', () => {
                windowPopup('정말 회원 탈퇴하시겠습니까?', '<button id="windowPopupCancel" class="bg-danger" type="button">취소</button>');

                document.querySelector('#windowPopupOk').id = 'userDeleteBtn';
                document.querySelectorAll('#userDeleteBtn').forEach((el) => {
                    el.addEventListener('click', () => { // 회원탈퇴
                        el.closest('#popupBg').remove();

                        if (user.emailVerified) { // 이메일 인증한 유저는 본인확인 처리 과정을 패스함 (boolean 값)
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
        });

        document.querySelector('.user-name').addEventListener('mouseleave', () => { // 내 정보 박스 삭제
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

        /**
         * portfolio sites write
         */
        document.querySelector('#portfolioSiteWriteBtn').addEventListener('click', () => {
            portfolioSite();
            siteCategoriesSelected();
            siteTypeSelected();
            fileChange();

            document.querySelector('#writeBtn').addEventListener('click', () => { // 포트폴리오 사이트 글 등록하기
                if (isSuperAdmin) {
                    if (siteCategoriesData !== '' && siteTypeData !== '' && siteName.value !== '' && siteDescription.value !== '' && siteLink.value !== '' && fileUpload !== undefined) {
                        let dataSave = {
                            categories: siteCategoriesData, // 분류
                            type: siteTypeData, // 유형
                            title: siteName.value, // 이름
                            description: siteDescription.value, // 설명
                            link: siteLink.value, // 주소
                            thumbnailUrl: siteThumbnailUrl, // 썸네일 이미지 주소
                        };

                        dbFireStore().collection('site').add(dataSave).then(() => {
                            windowPopup('정상적으로 등록 되었습니다.');

                            document.querySelector('#windowPopupOk').addEventListener('click', () => {
                                reload();
                            });
                        }).catch((error) => {
                            windowPopup('등록이 실패하였습니다, 잠시 후 다시 시도해주세요.<br>' + error.message);
                        });
                    } else {
                        windowPopup('모든 항목에 선택/입력 해주세요.');
                    }
                } else {
                    windowPopup('권한이 없습니다.<br>시스템 관리자에게 문의바랍니다.');
                }
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
                    '<input type="password" name="password" value="" autocomplete="off" placeholder="패스워드을(를) 입력해주세요." />' +
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
                            '<img src="./images/sns/github_icon.png" title="깃허브 이메일로 로그인" alt="깃허브 이메일로 로그인" />' +
                            '<span>github</span>' +
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
                        '<p>패스워드를 잊어버리셨나요?</p>' +
                        '<button type="button" onclick="passwordReset();">재설정</button>' +
                    '</div>' +
                '</div>' +
            '</div>',
            );
        });

        /**
         * admin button
         */
        document.querySelectorAll('.auth-btn').forEach((el) => {
            el.addEventListener('click', () => {
                windowPopup('회원이 아니시라면 회원가입 후 이용 해주세요.');
            });
        });
    }
});

/**
 * portfolio sites list
 */
dbFireStore().collection('site').get().then((snapshot) => { // 컬랙션 site에서 모든 문서를 가져오기 위함
    const siteNoListTempleat = '' +
        '<div>게시물이 없습니다.</div>';

    snapshot.forEach((doc) => {
        let categoriesName = doc.data().categories;
        let docData = doc.data();

        const siteListTempleat = '' +
            '<div id="'+ doc.id +'" class="site-thumbnail-box">' +
                '<img src="' + docData.thumbnailUrl + '" title="' + docData.title + '" />' +
            '</div>';

        console.log(doc.id);
        console.log(docData);

        dbFireStore().collection('site').where('categories', '==', '쇼핑몰').get().then((result) => {
            let docLength = result.docs.length;
            // console.log(docLength);

            if (categoriesName === '쇼핑몰' && docLength !== 0) {
                document.querySelector('#shoppingMallList').innerHTML += siteListTempleat;
            } else if (docLength === 0) {
                document.querySelector('#shoppingMallList').innerHTML = siteNoListTempleat;
            }
        });

        dbFireStore().collection('site').where('categories', '==', '호텔/팬션').get().then((result) => {
            let docLength = result.docs.length;
            // console.log(docLength);

            if (categoriesName === '호텔/팬션' && docLength !== 0) {
                document.querySelector('#hotelList').innerHTML += siteListTempleat;
            } else if (docLength === 0) {
                document.querySelector('#hotelList').innerHTML = siteNoListTempleat;
            }
        });

        dbFireStore().collection('site').where('categories', '==', '교육/IT솔루션 서비스').get().then((result) => {
            let docLength = result.docs.length;
            // console.log(docLength);

            if (categoriesName === '교육/IT솔루션 서비스' && docLength !== 0) {
                document.querySelector('#solutionServiceList').innerHTML += siteListTempleat;
            } else if (docLength === 0) {
                document.querySelector('#solutionServiceList').innerHTML = siteNoListTempleat;
            }
        });

        dbFireStore().collection('site').where('categories', '==', '제조장비 반도체산업').get().then((result) => {
            let docLength = result.docs.length;
            // console.log(docLength);

            if (categoriesName === '제조장비 반도체산업' && docLength !== 0) {
                document.querySelector('#semiconductorList').innerHTML += siteListTempleat;
            } else if (docLength === 0) {
                document.querySelector('#semiconductorList').innerHTML = siteNoListTempleat;
            }
        });

        dbFireStore().collection('site').where('categories', '==', '기타').get().then((result) => {
            let docLength = result.docs.length;
            // console.log(docLength);

            if (categoriesName === '기타' && docLength !== 0) {
                document.querySelector('#etcList').innerHTML += siteListTempleat;
            } else if (docLength === 0) {
                document.querySelector('#etcList').innerHTML = siteNoListTempleat;
            }
        });

        // 이슈가 있어서 settimeout 임시로.. 추후에 변경해야함
        setTimeout(() => {
            const siteThumbnailTempleat = '' +
                '<div class="site-thumbnail-view site-thumbnail-view-'+ doc.id +'">' +
                    '<div class="btn-wrap">' +
                        '<button id="modifyBtn" class="btn-type-1 site-thumbnail-view-btn" data-id="'+ doc.id +'" type="button">수정</button>' +
                        '<button id="deleteBtn" class="btn-type-1 bg-danger site-thumbnail-view-btn" data-id="'+ doc.id +'" type="button">삭제</button>' +
                    '</div>' +
                    '<span class="site-thumbnail-view-type">' + docData.type + '</span>' +
                    '<h3 class="site-thumbnail-view-title">' + docData.title + '</h3>' +
                    '<p class="site-thumbnail-view-description">' + docData.description + '</p>' +
                    '<a class="site-thumbnail-view-link" href="' + docData.link + '" target="_blank">' +
                        'view more' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="rgba(255,255,255,1)"/></svg>' +
                    '</a>' +
                '</div>';

            // querySelector는 인자값으로 숫자를 받지못해서 id를 지정했을때 고유의 값이라 숫자를 인식 못하여 getElementById 함수로 사용함
            // 예) id="5RLvZOBC1iPl3UEO0nwD"
            let docID = document.getElementById(''+ doc.id +'')

            // 상단에 siteListTempleat 변수에 정의한 html의 doc.id(문서의 고유id)값을 가져와서 매치하여 이벤트 실행
            docID.addEventListener('mouseenter', () => {
                document.getElementById(''+ doc.id +'').insertAdjacentHTML('afterbegin', siteThumbnailTempleat);

                /**
                 * portfolio sites write update
                 */
                document.querySelectorAll('#modifyBtn').forEach((el) => { // 수정
                    el.addEventListener('click', (e) => {
                        if (isUser) {
                            portfolioSite();
                            siteCategoriesSelected();
                            siteTypeSelected();
                            fileChange();

                            document.querySelector('#writeBtn').id = 'writeModifyBtn';
                            document.querySelector('.modal-title h2').textContent = '프로젝트를 수정 해보세요 :)';
                            document.querySelector('#writeModifyBtn').textContent = '수정하기';
                            document.querySelector('#writeModifyBtn').dataset.id = el.getAttribute('data-id');

                            document.querySelector('#siteName').value = docData.title;
                            document.querySelector('#siteDescription').value = docData.description;
                            document.querySelector('#siteLink').value = docData.link;
                            document.querySelector('.file-name').value = docData.thumbnailUrl;

                            document.querySelectorAll('#writeModifyBtn').forEach((el) => {
                                el.addEventListener('click', (e) => { // 포트폴리오 사이트 글 수정
                                    if (isSuperAdmin) {
                                        let dataUpdateSave = {
                                            categories: siteCategoriesData, // 분류
                                            type: siteTypeData, // 유형
                                            title: siteName.value, // 이름
                                            description: siteDescription.value, // 설명
                                            link: siteLink.value, // 주소
                                            thumbnailUrl: (siteThumbnailUrl === '') ? document.querySelector('.file-name').value : siteThumbnailUrl, // 썸네일 이미지 주소
                                        };

                                        dbFireStore().collection('site').doc(e.target.dataset.id).update(dataUpdateSave).then(() => {
                                            windowPopup('게시물이 수정되었습니다.');

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
                        } else {
                            windowPopup('회원이 아니시라면 회원가입 후 이용 해주세요.');
                        }
                    });
                });

                /**
                 * portfolio sites write delete
                 */
                document.querySelectorAll('#deleteBtn').forEach((el) => { // 삭제
                    el.addEventListener('click', () => {
                        if (isUser) {
                            windowPopup('"' + docData.title + '" 게시물을 삭제하시겠습니까?<br>한번 삭제를하면 복구가 불가능합니다.', '<button id="windowPopupCancel" class="bg-danger" type="button">취소</button>');
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
                        } else {
                            windowPopup('회원이 아니시라면 회원가입 후 이용 해주세요.');
                        }
                    });
                });
            });

            // 상단에 siteThumbnailTempleat 변수에 정의한 html의 site-thumbnail-view-'+doc.id' 매치하여 이벤트 실행
            docID.addEventListener('mouseleave', () => {
                document.querySelector('.site-thumbnail-view-'+doc.id).remove();
            });
        }, 500);
    });
});

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
    } else if (!self.closest('.sign-auth-wrap').classList.contains('switch-mode')) { // 회원가입 하기
        self.closest('.sign-auth-wrap button').textContent = '로그인';
        document.querySelector('.modal-title h2').textContent = '회원가입을 해주세요 :)';
        document.querySelector('.qa-member p').textContent = '계정이 이미 있으신가요?';
        document.querySelector('.sign-in-box').className = 'sign-up-box';
        document.querySelector('.sign-up-box .sign-btn').textContent = '가입하기';
        document.querySelector('.sns-sign-in-box').style.display = 'none';
        document.querySelector('.qa-password-find').style.display = 'none';

        let inputNameHtml = '<input type="text" name="name" value="" autocomplete="off" placeholder="이름을(를) 입력해주세요." />';
        // let emailCertificationHtml = '<button id="emailCertificationBtn" class="email-certification-btn modal-btn-type-2" type="button">인증하기</button>';
        let inputPasswordHtml = '' +
            '<div class="input-wrap">' +
                '<input type="password" name="re_password" value="" autocomplete="off" placeholder="패스워드을(를) 한번 더 입력해주세요." />' +
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

    if (self.textContent === '로그인하기') {
        if (!userEmail) {
            windowPopup('이메일을(를) 입력해주세요.');
            return;
        } else if (!emailCheck(userEmail)) {
            windowPopup('이메일 형식이 올바르지 않습니다.');
            return;
        } else if (!userPassword) {
            windowPopup('패스워드을(를) 입력해주세요.');
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
            windowPopup('회원정보가 일치하지 않습니다.<br>회원이 아니시라면 회원가입 후 이용해주세요.');
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
    } else if (self.textContent === 'github') {
        dbAuth().signInWithRedirect(githubProvider);
        // dbAuth().getRedirectResult().then((result) => { // 인증 절차 진행 전 페이지가 로드될때 OAuth 토큰 정보를 가져와서 볼 수 있음
        //     alert(JSON.stringify(githubProvider));
        // }).catch((error) => {
        //     windowPopup('잠시 후 다시 시도해주세요.'+error.message);
        // });
    } else if (self.textContent === 'kakao') {
        windowPopup('서비스 개발중입니다.');
    } else if (self.textContent === '가입하기') {
        let userName = document.querySelector('input[name=name]').value;
        let user_rePassword = document.querySelector('input[name=re_password]').value;

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
            windowPopup('패스워드을(를) 입력해주세요.');
            return;
        } else if (userPassword !== user_rePassword) {
            windowPopup('패스워드가 일치하지 않습니다.');
            return;
        }

        dbAuth().createUserWithEmailAndPassword(userEmail, userPassword).then(result => { // 회원가입
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
                windowPopup('패스워드는 6자 이상이어야 합니다.');
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
            dbAuth().sendPasswordResetEmail(userEmail).then(() => { // 패스워드 재설정
                windowPopup('해당 이메일로 링크를 전송하였습니다.<br>메일함을 확인해주세요.');
            }).catch(error => {
                windowPopup('잠시 후 다시 시도해주세요<br>' + error.message);
            });
        }
    }
}

function passwordReset() {
    document.querySelector('.sign-in-box').className = 'password-reset-box';
    document.querySelector('.modal-title h2').textContent = '이메일로 패스워드 재설정 링크를 보내드려요 :)';
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
    el.addEventListener('click', () =>  {
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
        // el.innerHTML += skillTempleat;
        el.insertAdjacentHTML('afterbegin', skillTempleat);
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