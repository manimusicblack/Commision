document.addEventListener('DOMContentLoaded', function () {
  // قوانین کمیسیون بر اساس شهر و نوع قرارداد
  const commissionRules = {
    "تهران": {
      "خرید و فروش": (amount) => amount * 0.0025,
      "رهن و اجاره": (rahn, rent) => {
        const baseCommission = (rahn * 0.005) + (rent / 4);
        return baseCommission;
      }
    },
    "ورامین": {
      "خرید و فروش": (amount) =>
        amount <= 1_000_000_000
          ? amount * 0.01
          : 1_000_000_000 * 0.01 + (amount - 1_000_000_000) * 0.005,
      "رهن و اجاره": (rahn, rent) => ((rahn * 0.03) + rent) / 3
    },
    "پاکدشت": {
      "خرید و فروش": (amount) =>
        amount <= 1_000_000_000
          ? amount * 0.01
          : 1_000_000_000 * 0.01 + (amount - 1_000_000_000) * 0.005,
      "رهن و اجاره": (rahn, rent) => ((rahn * 0.03) + rent) / 3
    },
    "پیشوا": {
      "خرید و فروش": (amount) =>
        amount <= 1_000_000_000
          ? amount * 0.01
          : 1_000_000_000 * 0.01 + (amount - 1_000_000_000) * 0.005,
      "رهن و اجاره": (rahn, rent) => ((rahn * 0.03) + rent) / 3
    },
    "شهریار": {
      "خرید و فروش": (amount) =>
        amount <= 1_000_000_000
          ? amount * 0.05
          : 1_000_000_000 * 0.05 + (amount - 1_000_000_000) * 0.005,
      "رهن و اجاره": (rahn, rent) => ((rahn * 0.03) + rent) / 3
    },
  };

  //  دراپ‌دان‌ها
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== this) d.classList.remove('open');
      });
      this.classList.toggle('open');
    });

    dropdown.querySelectorAll('.dropdown-options div').forEach(option => {
      option.addEventListener('click', function (e) {
        e.stopPropagation();
        const dropdown = this.closest('.dropdown');
        dropdown.childNodes[0].textContent = this.textContent;
        dropdown.classList.remove('open');
        checkSelections();
      });
    });
  });

  document.body.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  });

  // انتخاب‌ها
  function getSelectedValue(id) {
    const dropdown = document.querySelector(`.dropdown[data-id="${id}"]`);
    if (!dropdown) return '';
    return dropdown.childNodes[0].textContent.trim();
  }

  function checkSelections() {
    const contract = getSelectedValue("contract");

    const commissionCalc = document.querySelector('.commission-calc');
    const rahnBox = document.getElementById('rahn-ejareh-box');
    const houseImg = document.querySelector('.house-img');

    if (contract === "خرید و فروش") {
      commissionCalc.classList.remove("hidden");
      rahnBox.classList.add("hidden");
      houseImg.classList.add("hidden");
    } else if (contract === "رهن و اجاره") {
      commissionCalc.classList.add("hidden");
      rahnBox.classList.remove("hidden");
      houseImg.classList.add("hidden");
    } else {
      commissionCalc.classList.add("hidden");
      rahnBox.classList.add("hidden");
      houseImg.classList.remove("hidden");
    }
  }

  // تبدیل اعداد
  function toPersianDigits(str) {
    const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return str.replace(/\d/g, d => persianDigits[d]);
  }

  function toEnglishDigits(str) {
    const persianDigits = /[۰-۹]/g;
    return str.replace(persianDigits, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  // خرید و فروش
  const totalPriceInput = document.getElementById('total-price');
  const commissionOneSide = document.getElementById('commission-one-side');
  const vatAmount = document.getElementById('vat-amount');
  const totalPayable = document.getElementById('total-payable');

  if (totalPriceInput) {
    totalPriceInput.addEventListener('input', function () {
      const rawValue = toEnglishDigits(this.value).replace(/\D/g, '');
      const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      this.value = toPersianDigits(formatted);
      const amount = parseFloat(rawValue) || 0;

      const city = getSelectedValue("city");
      const contract = getSelectedValue("contract");

      let commission = 0;
      if (commissionRules[city] && commissionRules[city][contract]) {
        commission = commissionRules[city][contract](amount);
      }

      const vat = commission * 0.1;
      const total = commission + vat;

      const formatOutput = (val) =>
        toPersianDigits(Math.round(val).toLocaleString('fa-IR').replace(/,/g, '.'));

      commissionOneSide.textContent = `${formatOutput(commission)} تومان`;
      vatAmount.textContent = `${formatOutput(vat)} تومان`;
      totalPayable.innerHTML = `<span class="highlight-amount">${formatOutput(total)}</span> تومان`;
    });
  }

  // رهن و اجاره
  const rahnInput = document.getElementById('rahn-price');
  const rentInput = document.getElementById('rent-price');
  const commissionOneSideRahn = document.getElementById('commission-one-side-rahn');
  const vatAmountRahn = document.getElementById('vat-amount-rahn');
  const totalPayableRahn = document.getElementById('total-payable-rahn');

  function calculateRahnEjareh() {
    const rawRahn = toEnglishDigits(rahnInput.value).replace(/\D/g, '');
    const rawRent = toEnglishDigits(rentInput.value).replace(/\D/g, '');
    const rahn = parseFloat(rawRahn) || 0;
    const rent = parseFloat(rawRent) || 0;

    const city = getSelectedValue("city");
    const contract = "رهن و اجاره";

    let commission = 0;
    if (commissionRules[city] && commissionRules[city][contract]) {
      commission = commissionRules[city][contract](rahn, rent);
    }

    const vat = commission * 0.1;
    const total = commission + vat;

    const formatOutput = (val) =>
      toPersianDigits(Math.round(val).toLocaleString('fa-IR').replace(/,/g, '.'));

    commissionOneSideRahn.textContent = `${formatOutput(commission)} تومان`;
    vatAmountRahn.textContent = `${formatOutput(vat)} تومان`;
    totalPayableRahn.innerHTML = `<span class="highlight-amount">${formatOutput(total)}</span> تومان`;
  }

  rahnInput.addEventListener('input', function () {
    let rawValue = toEnglishDigits(this.value).replace(/\D/g, '');
    this.value = toPersianDigits(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    calculateRahnEjareh();
  });

  rentInput.addEventListener('input', function () {
    let rawValue = toEnglishDigits(this.value).replace(/\D/g, '');
    this.value = toPersianDigits(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    calculateRahnEjareh();
  });

  // دکمه پشتیبانی
  document.getElementById('support-button').addEventListener('click', function () {
    window.open('https://t.me/Tehrancity2024', '_blank');
  });

  // اسلایدر مشاورین
  new Swiper('.advisor-slider', {
    loop: true,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    slidesPerView: 3,
    spaceBetween: 20,
    centeredSlides: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }
  });

});

// POPUP MODAL
const modal = document.getElementById("advisor-modal");
const modalImg = document.getElementById("modal-img");
const modalName = document.getElementById("modal-name");
const modalInfo = document.getElementById("modal-info");
const modalCity = document.getElementById("modal-city");
const modalOffice = document.getElementById("modal-office");
const modalContact = document.getElementById("modal-contact");
const closeBtn = document.querySelector(".close-btn");

// لیست مشاورهایی که دکمه گفتگو برایشان غیرفعال است
const noContactAdvisors = ["راضیه ناصحی", "مریم شریفی", "مجتبی حسن نصب","سعید اشرف","نگار رضایی","اسماعیل اشرف"]; // اسم مشاورها را اینجا اضافه کن

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

const advisorCards = document.querySelectorAll(".advisor-card");
advisorCards.forEach(card => {
  card.addEventListener("click", () => {
    const img = card.querySelector("img").src;
    const name = card.querySelector(".advisor-name").textContent;
    const info = card.querySelector(".advisor-info").textContent;
    const city = card.querySelector(".advisor-city").textContent;

    const telegramLink = "https://t.me/Tehrancity2024";

    modalImg.src = img;
    modalName.textContent = name;
    modalInfo.textContent = info;
    modalCity.textContent = `شهر: ${city}`;
    modalOffice.textContent = `دفتر: ${info}`;

    // بررسی و غیرفعال کردن دکمه در صورت نیاز
    if (noContactAdvisors.includes(name.trim())) {
      modalContact.removeAttribute("href");
      modalContact.classList.add("disabled");
      modalContact.textContent = " گفتگو غیرفعال";
    } else {
      modalContact.href = telegramLink;
      modalContact.classList.remove("disabled");
      modalContact.textContent = "گفتگو در تلگرام";
    }

    modal.classList.remove("hidden");
  });
});
