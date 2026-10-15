/* ملف الدوال الوحيد للموقع: myFunctions.js */

/* ---------- دوال مساعدة ---------- */

// تنسيق الأرقام مع فاصل الآلاف
function formatMoney(n) {
    var s = String(Math.round(n));
    var out = "";
    for (var i = 0; i < s.length; i++) {
        if (i > 0 && (s.length - i) % 3 === 0) {
            out += ",";
        }
        out += s.charAt(i);
    }
    return out + " ل.س";
}

// تحويل نص بصيغة yyyy-mm-dd إلى تاريخ، وإرجاع null إذا كان غير صحيح
function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (m === null) {
        return null;
    }
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10);
    var d = parseInt(m[3], 10);
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
        return null;
    }
    return dt;
}

// عدد الأيام بين تاريخين
function daysBetween(start, end) {
    return Math.round((end.getTime() - start.getTime()) / 86400000);
}

// تحويل الأرقام العربية الهندية (٠-٩) إلى أرقام إنكليزية
function toEnglishDigits(str) {
    return str.replace(/[\u0660-\u0669]/g, function (ch) {
        return String(ch.charCodeAt(0) - 0x0660);
    });
}

/* ---------- دوال التحقق: تعيد نص الخطأ أو "" إذا كان الإدخال صحيحاً ---------- */

// الاسم: أحرف عربية ومسافات فقط (يقبل الفراغ)
function checkName(v) {
    if (v === "") {
        return "";
    }
    if (!/^[ء-يً-ْ]+( [ء-يً-ْ]+)*$/.test(v)) {
        return "الاسم يجب أن يحتوي أحرفاً عربية فقط";
    }
    return "";
}

// الرقم الوطني: 11 خانة، أول خانتين من 01 إلى 14
function checkNationalId(v) {
    if (v === "") {
        return "الرقم الوطني إلزامي";
    }
    if (!/^\d{11}$/.test(v)) {
        return "الرقم الوطني يجب أن يتألف من 11 رقماً";
    }
    var gov = parseInt(v.substring(0, 2), 10);
    if (gov < 1 || gov > 14) {
        return "أول خانتين يجب أن تكونا بين 01 و 14";
    }
    return "";
}

// الموبايل: 10 أرقام بالضبط، البادئة 093/098/099 (Syriatel) أو 094/095/096 (MTN)
function checkMobile(v) {
    if (v === "") {
        return "";
    }
    if (!/^09[0-9]{8}$/.test(v)) {
        return "رقم الموبايل يجب أن يتألف من 10 أرقام ويبدأ بـ 09";
    }
    if (!/^09[345689]/.test(v)) {
        return "البادئة يجب أن تكون 093 أو 098 أو 099 (Syriatel) أو 094 أو 095 أو 096 (MTN)";
    }
    return "";
}

// البريد الإلكتروني (يقبل الفراغ)
function checkEmail(v) {
    if (v === "") {
        return "";
    }
    if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/.test(v)) {
        return "البريد الإلكتروني غير صحيح";
    }
    return "";
}

// تاريخ البداية والنهاية
function checkDates(s, e) {
    var errors = { start: "", end: "" };
    var ds = null;
    var de = null;
    if (s === "") {
        errors.start = "تاريخ البداية إلزامي";
    } else {
        ds = parseDate(s);
        if (ds === null) {
            errors.start = "الصيغة يجب أن تكون yyyy-mm-dd وتاريخاً حقيقياً";
        }
    }
    if (e === "") {
        errors.end = "تاريخ النهاية إلزامي";
    } else {
        de = parseDate(e);
        if (de === null) {
            errors.end = "الصيغة يجب أن تكون yyyy-mm-dd وتاريخاً حقيقياً";
        }
    }
    if (ds !== null && de !== null && de.getTime() <= ds.getTime()) {
        errors.end = "تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية";
    }
    return errors;
}

/* ---------- الواجهة التفاعلية (jQuery) ---------- */

// قراءة السيارات المختارة من الجدول
function getSelectedCars() {
    var cars = [];
    $("input.pick:checked").each(function () {
        var row = $(this).closest("tr");
        cars.push({
            code: row.attr("id"),
            model: row.find("td.model").text(),
            price: parseInt(row.find("td.price").attr("title"), 10)
        });
    });
    return cars;
}

// زر متابعة
function goNext() {
    var cars = getSelectedCars();
    if (cars.length === 0) {
        $("#pickMsg").text("يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.");
        $("#bookingForm").slideUp();
        return;
    }
    $("#pickMsg").text("");
    $("#bookingForm").slideDown();
    $("#selectedList").text(cars.map(function (c) { return c.model; }).join("، "));
}

function setError(id, msg) {
    $("#err_" + id).text(msg);
    return msg === "";
}

// إبقاء الأرقام فقط في الحقل (ويحوّل الأرقام العربية إلى إنكليزية)
function keepDigits(id) {
    var el = $("#" + id);
    el.val(toEnglishDigits(el.val()).replace(/[^0-9]/g, ""));
}

// حقل تاريخ: أرقام فقط مع إضافة الشرطة تلقائياً بصيغة yyyy-mm-dd
function formatDateField(id) {
    var d = toEnglishDigits($("#" + id).val()).replace(/[^0-9]/g, "").substring(0, 8);
    var out = d;
    if (d.length > 6) {
        out = d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6);
    } else if (d.length > 4) {
        out = d.substring(0, 4) + "-" + d.substring(4);
    }
    $("#" + id).val(out);
}

// التحقق الفوري من حقل واحد أثناء الكتابة أو عند مغادرته
function validateField(id) {
    var v = toEnglishDigits($.trim($("#" + id).val()));
    if (id === "fullName") {
        return setError(id, checkName(v));
    }
    if (id === "nationalId") {
        return setError(id, checkNationalId(v));
    }
    if (id === "mobile") {
        return setError(id, checkMobile(v));
    }
    if (id === "email") {
        return setError(id, checkEmail(v));
    }
    // التاريخان يتحققان معاً لأن النهاية تعتمد على البداية
    var d = checkDates(toEnglishDigits($.trim($("#startDate").val())),
                       toEnglishDigits($.trim($("#endDate").val())));
    var startTouched = $.trim($("#startDate").val()) !== "";
    var endTouched = $.trim($("#endDate").val()) !== "";
    setError("startDate", startTouched ? d.start : "");
    setError("endDate", endTouched ? d.end : "");
    return d.start === "" && d.end === "";
}

// زر إرسال
function submitBooking() {
    var name = $.trim($("#fullName").val());
    var nid = toEnglishDigits($.trim($("#nationalId").val()));
    var start = toEnglishDigits($.trim($("#startDate").val()));
    var end = toEnglishDigits($.trim($("#endDate").val()));
    var mobile = toEnglishDigits($.trim($("#mobile").val()));
    var email = $.trim($("#email").val());

    var ok = true;
    ok = setError("fullName", checkName(name)) && ok;
    ok = setError("nationalId", checkNationalId(nid)) && ok;
    var d = checkDates(start, end);
    ok = setError("startDate", d.start) && ok;
    ok = setError("endDate", d.end) && ok;
    ok = setError("mobile", checkMobile(mobile)) && ok;
    ok = setError("email", checkEmail(email)) && ok;

    if (!ok) {
        return;
    }

    var cars = getSelectedCars();
    if (cars.length === 0) {
        $("#pickMsg").text("يرجى اختيار سيارة واحدة على الأقل.");
        return;
    }

    var days = daysBetween(parseDate(start), parseDate(end));
    var subtotal = 0;
    var rows = "";
    for (var i = 0; i < cars.length; i++) {
        var carTotal = cars[i].price * days;
        subtotal += carTotal;
        rows += "<tr><td>" + cars[i].model + "</td><td>" + days + "</td><td>" +
                formatMoney(cars[i].price) + "</td><td>" + formatMoney(carTotal) + "</td></tr>";
    }
    var discount = 0;
    if (days > 7) {
        discount = subtotal * 0.10;
    }
    var finalTotal = subtotal - discount;

    var html = "<h2>نتيجة طلب الحجز</h2>";
    if (name !== "") {
        html += "<p>مقدم الطلب: " + name + "</p>";
    }
    html += "<table><tr><th>السيارة</th><th>عدد الأيام</th><th>السعر اليومي</th><th>المجموع</th></tr>" +
            rows + "</table>";
    html += "<p>المجموع قبل الخصم: " + formatMoney(subtotal) + "</p>";
    if (discount > 0) {
        html += "<p>خصم 10% (مدة التأجير أكثر من 7 أيام): " + formatMoney(discount) + "</p>";
    } else {
        html += "<p>لا يوجد خصم (مدة التأجير 7 أيام أو أقل).</p>";
    }
    html += "<p class=\"total-line\">المبلغ الإجمالي النهائي: <span id=\"finalVal\">" + formatMoney(finalTotal) + "</span></p>";
    html += "<p class=\"center\"><input type=\"button\" id=\"closeResult\" value=\"إغلاق\" /></p>";

    $("#resultBox").html(html);
    $("#overlay").fadeIn();

    // عدّاد متحرك للمبلغ النهائي
    $({ v: 0 }).animate({ v: finalTotal }, {
        duration: 900,
        step: function (now) {
            $("#finalVal").text(formatMoney(now));
        },
        complete: function () {
            $("#finalVal").text(formatMoney(finalTotal));
        }
    });
}

// شريط الصور المتحرك في الصفحة الرئيسية
function startSlider() {
    var imgs = $("#slider img");
    if (imgs.length < 2) {
        return;
    }
    var cur = 0;
    setInterval(function () {
        imgs.eq(cur).fadeOut(500);
        cur = (cur + 1) % imgs.length;
        imgs.eq(cur).fadeIn(500);
    }, 2200);
}

// عدّادات الأرقام في الصفحة الرئيسية
function startCounters() {
    $(".num").each(function () {
        var el = $(this);
        var target = parseInt(el.text(), 10);
        el.text("0");
        $({ v: 0 }).animate({ v: target }, {
            duration: 1500,
            step: function (now) {
                el.text(Math.round(now));
            },
            complete: function () {
                el.text(target);
            }
        });
    });
}

/* ---------- ربط الأحداث ---------- */
$(document).ready(function () {

    // ظهور سلس لمحتوى كل الصفحات
    $("#content").hide().fadeIn(500);

    startSlider();
    startCounters();

    // تمييز صف السيارة المختارة
    $("input.pick").change(function () {
        $(this).closest("tr").toggleClass("selected", this.checked);
    });

    // إظهار/إخفاء تفاصيل السيارة (عدة سيارات معاً)
    $("input.show-details").click(function () {
        var detailsRow = $(this).closest("tr").next("tr.details-row");
        if (this.checked) {
            detailsRow.fadeIn(200);
        } else {
            detailsRow.fadeOut(200);
        }
    });

    // لوحة أرقام فقط: الرقم الوطني والموبايل أرقام، والتاريخ يُنسَّق تلقائياً
    $("#nationalId, #mobile").on("input", function () { keepDigits(this.id); });
    $("#startDate, #endDate").on("input", function () { formatDateField(this.id); });

    // تحقق فوري على الحقول
    $("#bookingForm input.live").on("input blur", function () {
        validateField(this.id);
    });

    $("#nextBtn").click(goNext);
    $("#submitBtn").click(submitBooking);

    // إغلاق نافذة النتيجة
    $("#overlay").on("click", "#closeResult", function () {
        $("#overlay").fadeOut();
    });
});
