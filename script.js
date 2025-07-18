document.addEventListener('DOMContentLoaded', function() {
  // Dropdowns
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
        checkSelections(); // بررسی شرایط بعد از انتخاب هر گزینه
      });
    });
  });

  document.body.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  });

  // Swiper برای بخش advisor
  const advisorSwiper = new Swiper('.advisor-slider', {
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
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    }
  });

  function getSelectedValue(id) {
    const dropdown = document.querySelector(`.dropdown[data-id="${id}"]`);
    if (!dropdown) {
      console.error(`Dropdown with id ${id} not found`);
      return '';
    }
    const value = dropdown.childNodes[0].textContent.trim();
    console.log(`Selected value for ${id}:`, value);
    return value;
  }

  function checkSelections() {
    const province = getSelectedValue("province");
    const city = getSelectedValue("city");
    const contract = getSelectedValue("contract");

    const commissionCalc = document.querySelector('.commission-calc');
    const houseImg = document.querySelector('.house-img');

    const conditionsMet = province === "تهران" && city === "پیشوا" && contract === "خرید و فروش";
    const rahnBox = document.getElementById('rahn-ejareh-box');


    if (conditionsMet) {
      commissionCalc.classList.remove("hidden");
      houseImg.classList.add("hidden"); // پنهان کردن تصویر
    }
     else if (contract === "رهن و اجاره") {
  commissionCalc.classList.add("hidden");
  rahnBox.classList.remove("hidden");
  houseImg.classList.add("hidden");
    }
    else {
      commissionCalc.classList.add("hidden");
      rahnBox.classList.add("hidden");
      houseImg.classList.remove("hidden");
    }
  }

  const totalPriceInput = document.getElementById('total-price');

  // تبدیل اعداد انگلیسی به فارسی
  function toPersianDigits(str) {
    const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return str.replace(/\d/g, d => persianDigits[d]);
  }

  // تبدیل اعداد فارسی به انگلیسی
  function toEnglishDigits(str) {
    const persianDigits = /[۰-۹]/g;
    return str.replace(persianDigits, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  if (totalPriceInput) {
    totalPriceInput.addEventListener('input', function () {
      // تبدیل اعداد فارسی به انگلیسی و حذف غیر عدد
      let rawValue = toEnglishDigits(this.value).replace(/\D/g, '');

      // فرمت هزارگان با نقطه
      const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // نمایش در input با عدد فارسی و نقطه
      this.value = toPersianDigits(formatted);

      // ادامه محاسبه
      const amount = parseFloat(rawValue) || 0;

      const commissionOneSide = document.getElementById('commission-one-side');
      const vatAmount = document.getElementById('vat-amount');
      const totalPayable = document.getElementById('total-payable');

      let commission = 0;

      if (amount <= 1_000_000_000) {
        commission = amount * 0.005;
      } else {
        const firstPart = 1_000_000_000 * 0.005;
        const secondPart = (amount - 1_000_000_000) * 0.0025;
        commission = firstPart + secondPart;
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
  
    // فرمول محاسبه کمیسیون برای رهن و اجاره
    const commission = (rahn * 0.01) + (rent * 0.25);
    const vat = commission * 0.10;
    const total = commission + vat;
  
    const formatOutput = (val) =>
      toPersianDigits(Math.round(val).toLocaleString('fa-IR').replace(/,/g, '.'));
  
    commissionOneSideRahn.textContent = `${formatOutput(commission)} تومان`;
    vatAmountRahn.textContent = `${formatOutput(vat)} تومان`;
    totalPayableRahn.innerHTML = `<span class="highlight-amount">${formatOutput(total)}</span> تومان`;
  }
  
  rahnInput.addEventListener('input', calculateRahnEjareh);
  rentInput.addEventListener('input', calculateRahnEjareh);
  
  rahnInput.addEventListener('input', function () {
    let rawValue = toEnglishDigits(this.value).replace(/\D/g, '');
    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.value = toPersianDigits(formatted);
    calculateRahnEjareh(); // محاسبه کمیسیون
  });
  
  rentInput.addEventListener('input', function () {
    let rawValue = toEnglishDigits(this.value).replace(/\D/g, '');
    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.value = toPersianDigits(formatted);
    calculateRahnEjareh(); // محاسبه کمیسیون
  });
  
  document.getElementById('support-button').addEventListener('click', function () {
    window.open('https://t.me/Tehrancity2024', '_blank');
  });
  


});