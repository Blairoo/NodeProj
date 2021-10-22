// index.js
window.setTimeout(function () {
    $(".alert-auto-dismissible").fadeTo(500, 0).slideUp(500, function () {
        $(this).remove();
    });
}, 4000);

// eyes jQuery
$(function () {
    // 눈표시 클릭 시 패스워드 보이기
    $('.eyes').on('click', function () {
        $('.joinpw').toggleClass('active');
        if ($('.joinpw').hasClass('active') == true) {
            $(this).find('.fa-eye').attr('class', "fas fa-eye-slash").parents('.inputpw').find(
                '.joinpw').attr('type', "text");
        } else {
            $(this).find('.fa-eye-slash').attr('class',
                "fas fa-eye").parents('.inputpw').find(
                '.joinpw').attr('type', 'password');
        }
    });
});

function ckid() {
    // 입력값을 변경했는데 중복확인 버튼이 보이지 않는 상황이면 다시 보이게
    $("#inputid").change(function () {
        if ($("#checkbutton").hasClass('d-none')) {
            $("#checkbutton").removeClass("d-none");
            $("#inputid").addClass("fail");
            $("#inputid").removeClass("success");
        }
    });
    if ($("#inputid").val() == '') {
        $(".idcheckmsg").html("아이디를 입력해주세요.");
        return;
    }
    overlap_input = $('#inputid').val();
    $.ajax({
        url: "checkid",
        data: {
            "user_id": overlap_input
        },
        dataType: "json",
        // csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
        success: function (data) {
            console.log(data["overlap"]);
            if (data["overlap"] == "fail") {
                $("#checkfail").removeClass("d-none");
                $('.idcheckmsg').css('color', '#fa525a');
                $(".idcheckmsg").html(
                    "<i class='fas fa-exclamation'></i>" + " " +
                    data["msg"]);
                return;
            } else if (data["overlap"] == "three") {
                $("#checkfail").removeClass("d-none");
                $('.idcheckmsg').css('color', '#fa525a');
                $(".idcheckmsg").html(
                    "<i class='fas fa-exclamation'></i>" + " " +
                    data["msg"]);
            } else if (data["overlap"] == "reg") {
                $("#checkfail").removeClass("d-none");
                $('.idcheckmsg').css('color', '#fa525a');
                $(".idcheckmsg").html(
                    "<i class='fas fa-exclamation'></i>" + " " +
                    data["msg"]);
            } else {
                $("#inputid").addClass("success");
                $("#inputid").removeClass("fail");
                $("#checksuccess").removeClass("d-none");
                $("#checkbutton").addClass("d-none");
                $('.idcheckmsg').css('color', '#6461e1');
                $(".idcheckmsg").html(
                    "<i class='fas fa-check'></i>" + " " + data[
                        "msg"]);
                return;
            }
        }
    });
}

$(function () {
    $("#pwcheck").keyup(function () {
        pw = $("#inputpw").val();
        pwck = $("#pwcheck").val();
        if (pw != "" || pwck != "") {
            if (pw == pwck) {
                $(".pwcheckmsg").removeClass("d-none");
            } else {
                $(".pwcheckmsg").addClass("d-none");
            }
        }
    });
});

// 중복확인을 하지 않은 경우
$(function () {
    $("#joinbtn").on("click", function () {
        if ($('#inputid').hasClass("fail")) {
            console.log('중복확인안함')
            $('.idcheckmsg').css('color', '#fa525a');
            $(".idcheckmsg").html(
                "<i class='fas fa-exclamation'></i>" + " " +
                "아이디 중복확인을 해주세요.");
            $('#inputid').focus();
            return false;
        }
    });
});

// login ajax
function ajaxlogin() {
    login_id = $('#loginid').val();
    login_pw = $('#loginpw').val();
    const url = $("#Urlhome").attr("data-url");
    $.ajax({
        url: "ajaxlogin",
        data: {
            "login_id": login_id,
            "login_pw": login_pw
        },
        dataType: "json",
        // csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
        success: function (data) {
            console.log(data["session_user"]);
            // login 정보 확인
            if (data["check"] == "fail") {
                console.log("none")
                $('.ajaxmsg').css('color', '#fa525a');
                $(".ajaxmsg").html("<i class='fas fa-exclamation'></i>" + " " +
                    data["msg"]);
                return;
                // 로그인 성공
            } else {
                console.log(data["session_user"]);
                location.href = url
                return;
            }
        }
    });
}