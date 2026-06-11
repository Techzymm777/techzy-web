/* global window, document */

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function formatMMK(amount) {
  return amount.toLocaleString() + " MMK";
}

const I18N = {
  en: {
    "common.skip": "Skip to content",
    "common.brandHomeAria": "Techzy home",
    "common.langToggleAria": "Switch language",
    "common.menuToggleAria": "Open menu",

    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.products": "Products",
    "nav.contact": "Contact",

    "footer.tagline": "Minimalist laptops and desktops for modern work.",
    "footer.about": "About",
    "footer.products": "Products",
    "footer.contact": "Contact",
    "footer.backToTop": "Back to top",
    "footer.copyrightName": "Techzy",
    "footer.themeLine": "Built in black, gray, and white.",

    "awn.hero.kicker": "Yangon · Est. for builders & gamers",
    "awn.hero.w1": "MACHINES",
    "awn.hero.w2": "WITH AN",
    "awn.hero.w3": "EDGE.",
    "awn.hero.lede":
      "Curated laptops for creators, gamers and teams — 100% genuine, or we refund double. That's the Techzy promise.",
    "awn.hero.ctaPrimary": "Browse the lineup",
    "awn.hero.ctaSecondary": "Our story",
    "awn.manifesto":
      "We don't stock everything. We stock the right things — every machine hand-picked, tested, and backed by a 2× refund guarantee if it isn't genuine.",
    "awn.cta.l1": "Ready when",
    "awn.cta.l2": "you are.",
    "awn.cta.button": "Talk to us",

    "home.hero.kicker": "Brand New. Factory Sealed. Only at Techzy.",
    "home.hero.title": "For those who want to unbox their brand new laptop themselves.",
    "home.hero.lede":
      "Discover top-quality brand new laptops for office, school, and business. From everyday use to enterprise performance.",
    "home.hero.ctaPrimary": "Browse Products",
    "home.hero.ctaSecondary": "How We Work",
    "home.metrics.aria": "Key metrics",
    "home.metrics.warrantyLabel": "Warranty",
    "home.metrics.warrantyValue": "2 years",
    "home.metrics.shippingLabel": "Shipping",
    "home.metrics.shippingValue": "Fast + insured",
    "home.metrics.supportLabel": "Support",
    "home.metrics.supportValue": "Real humans",
    "home.featured.title": "Featured picks",
    "home.featured.subtitle": "A quick look at what customers are buying this week.",
    "home.featured.link": "See all products",
    "home.why.title": "Why choose Techzy?",
    "home.why.body":
      "Every device is 100% genuine, factory-sealed, and backed by our no-questions guarantee. Real peace of mind from unboxing to beyond.",
    "home.why.f1Title": "100% Authenticity",
    "home.why.f1Body": "Every laptop is 100% brand new and genuine. If not, we refund 2x the purchase price. Guaranteed.",
    "home.why.f2Title": "30-Day Instant Replacement",
    "home.why.f2Body": "Manufacturer defect within the first month? We replace it immediately. No repairs, no delays.",
    "home.why.f3Title": "First-Hand Experience",
    "home.why.f3Body": "Every device arrives factory-sealed. You will be the very first person to open and experience your new tech.",
    "home.testimonials.title": "What Our Customers Say",
    "home.testimonials.subtitle": "Real feedback from real buyers.",

    "about.hero.kicker": "About us",
    "about.hero.title": "A minimalist approach to computers.",
    "about.hero.lede":
      "We sell carefully selected laptops and desktops that prioritize reliability, clean design, and quiet performance.",
    "about.beliefs.title": "What we believe",
    "about.beliefs.body":
      "Technology should fade into the background. Your machine should be fast, stable, and understated. That is the whole point.",
    "about.beliefs.quote": "“The best spec is the one you never have to think about.”",
    "about.beliefs.byline": "Techzy team",
    "about.cards.qTitle": "Quality checks",
    "about.cards.qBody":
      "Each model is validated for thermals, performance consistency, and daily-driver reliability.",
    "about.cards.pTitle": "Straight pricing",
    "about.cards.pBody": "Clear configurations, no confusing bundles, and no gimmicks.",
    "about.cards.rTitle": "Repair mindset",
    "about.cards.rBody":
      "We support upgrades and repairs where it makes sense, to extend the life of your machine.",
    "about.how.title": "How it works",
    "about.how.subtitle": "A simple process from selection to delivery.",
    "about.steps.s1Title": "Pick a category",
    "about.steps.s1Body": "Browse laptops, desktops, and accessories in one place.",
    "about.steps.s2Title": "Choose a configuration",
    "about.steps.s2Body":
      "Select a build that matches your workload: work, studio, or performance.",
    "about.steps.s3Title": "Get support",
    "about.steps.s3Body": "Ask a question, confirm compatibility, and get post-purchase help.",
    "about.cta.title": "Ready to browse?",
    "about.cta.body": "Explore our lineup of minimalist machines and clean builds.",
    "about.cta.button": "View Products",

    "products.hero.kicker": "Products",
    "products.hero.title": "Clean machines. Clear choices.",
    "products.hero.lede":
      "Use search, filters, and sorting to find your next laptop or desktop.",
    "products.filters.searchLabel": "Search",
    "products.filters.searchPlaceholder": "e.g. 16-inch, studio, RTX, ultralight",
    "products.filters.all": "All",
    "products.filters.laptops": "Laptops",
    "products.filters.desktops": "Desktops",
    "products.filters.accessories": "Accessories",
    "products.filters.sortLabel": "Sort",
    "products.sort.featured": "Featured",
    "products.sort.nameAsc": "Name: A to Z",
    "products.empty.title": "No matches",
    "products.empty.body": "Try a different search term, or reset filters to see everything.",
    "products.empty.reset": "Reset filters",
    "products.card.ask": "Ask about this",
    "products.card.buy": "Buy / Quote",
    "products.card.askAria": "Ask about {name} via the contact page",
    "products.card.buyAria": "Request a quote for {name}",

    "contact.hero.kicker": "Contact",
    "contact.hero.title": "Talk to a human.",
    "contact.hero.lede":
      "Questions about specs, shipping, warranties, or the right build? Send a message and we will respond soon.",
    "contact.form.title": "Send a message",
    "contact.form.subtitle":
      "This is a static site, so the form will open your email app with a pre-filled message.",
    "contact.form.nameLabel": "Name",
    "contact.form.emailLabel": "Email",
    "contact.form.messageLabel": "Message",
    "contact.form.messagePlaceholder":
      "Tell us what you need (use-case, budget, screen size, etc.)",
    "contact.form.submit": "Compose Email",
    "contact.form.reset": "Clear",
    "contact.form.direct": "Or email directly:",
    "contact.aside.hoursTitle": "Hours",
    "contact.aside.hoursBody": "Mon to Fri, 9:00 to 18:00",
    "contact.aside.supportTitle": "Support",
    "contact.aside.supportBody": "Include your model name and order number (if you have one).",
    "contact.aside.locationTitle": "Location",
    "contact.aside.locationBody":
      "We ship nationwide. Local pickup available by appointment.",

    "contact.err.name": "Please enter your name.",
    "contact.err.email": "Please enter a valid email.",
    "contact.err.message": "Please enter a message.",
    "contact.mail.subject": "Techzy inquiry from {name}",
    "contact.mail.footer": "Sent from the Techzy website.",
  },
  my: {
    "common.skip": "အကြောင်းအရာသို့ တိုက်ရိုက်သွားရန်",
    "common.brandHomeAria": "Techzy ပင်မစာမျက်နှာ",
    "common.langToggleAria": "ဘာသာစကား ပြောင်းရန်",
    "common.menuToggleAria": "မီနူး ဖွင့်ရန်",

    "nav.home": "ပင်မစာမျက်နှာ",
    "nav.about": "ကျွန်ုပ်တို့အကြောင်း",
    "nav.products": "ထုတ်ကုန်များ",
    "nav.contact": "ဆက်သွယ်ရန်",

    "footer.tagline": "ခေတ်မီလုပ်ငန်းအတွက် မီနီမယ်လ် လက်ပ်တော့နှင့် ဒက်စ်တော့များ။",
    "footer.about": "အကြောင်း",
    "footer.products": "ထုတ်ကုန်များ",
    "footer.contact": "ဆက်သွယ်ရန်",
    "footer.backToTop": "အပေါ်သို့ ပြန်သွားရန်",
    "footer.copyrightName": "Techzy",
    "footer.themeLine": "အနက်၊ မီးခိုး၊ အဖြူ အရောင်စနစ်ဖြင့် တည်ဆောက်ထားသည်။",

    "awn.hero.kicker": "ရန်ကုန် · Builder များနှင့် Gamer များအတွက်",
    "awn.hero.w1": "ထိပ်တန်း",
    "awn.hero.w2": "စွမ်းဆောင်ရည်",
    "awn.hero.w3": "စက်များ။",
    "awn.hero.lede":
      "Creator၊ gamer နှင့် အဖွဲ့များအတွက် လက်ရွေးစင် laptop များ — 100% စစ်မှန်သည်၊ မဟုတ်ပါက နှစ်ဆ ပြန်အမ်းပေးသည်။ ၎င်းသည် Techzy ၏ ကတိဖြစ်သည်။",
    "awn.hero.ctaPrimary": "ပစ္စည်းများ ကြည့်ရန်",
    "awn.hero.ctaSecondary": "ကျွန်ုပ်တို့အကြောင်း",
    "awn.manifesto":
      "ကျွန်ုပ်တို့သည် အရာအားလုံးကို မရောင်းပါ။ မှန်ကန်သည့်အရာများကိုသာ ရောင်းသည် — စက်တိုင်းကို လက်ရွေးစင် စမ်းသပ်ပြီး စစ်မှန်မှုမရှိပါက နှစ်ဆ ပြန်အမ်းအာမခံဖြင့် ရောင်းချသည်။",
    "awn.cta.l1": "အသင့်ဖြစ်ရင်",
    "awn.cta.l2": "လာခဲ့ပါ။",
    "awn.cta.button": "ဆက်သွယ်ရန်",

    "home.hero.kicker": "Brand New. Factory Sealed. Techzy တွင်သာ။",
    "home.hero.title": "Brand New Laptop တွေကို ကိုယ်တိုင် Unboxing လုပ်ချင်သူတွေအတွက်",
    "home.hero.lede":
      "ရုံးသုံး၊ ကျောင်းသုံးကနေစပြီး လုပ်ငန်းသုံးအထိ အကောင်းစား brand new laptops များကို ရှာဖွေမည်",
    "home.hero.ctaPrimary": "ထုတ်ကုန်များ ကြည့်ရန်",
    "home.hero.ctaSecondary": "ကျွန်ုပ်တို့၏ လုပ်နည်း",
    "home.metrics.aria": "အဓိက အချက်အလက်များ",
    "home.metrics.warrantyLabel": "အာမခံ",
    "home.metrics.warrantyValue": "၂ နှစ်",
    "home.metrics.shippingLabel": "ပို့ဆောင်မှု",
    "home.metrics.shippingValue": "မြန်ဆန် + အာမခံပါ",
    "home.metrics.supportLabel": "အကူအညီ",
    "home.metrics.supportValue": "လူသားအစစ်",
    "home.featured.title": "အကြံပြု ထုတ်ကုန်များ",
    "home.featured.subtitle": "ဒီအပတ်မှာ လူကြိုက်များနေတဲ့ မော်ဒယ်များကို မြန်မြန်ကြည့်ပါ။",
    "home.featured.link": "ထုတ်ကုန်အားလုံး ကြည့်ရန်",
    "home.why.title": "ဘာလို့ Techzy ကို ရွေးချယ်သင့်တာလဲ?",
    "home.why.body":
      "ကျွန်ုပ်တို့ရောင်းတဲ့ ထုတ်ကုန်တိုင်း စစ်မှန်ပြီး factory-sealed ဖြစ်တယ်လို့ အာမခံပါတယ်။ Unboxing ကနေ နောက်ပိုင်းအထိ မင်းရဲ့ စိတ်ချမှုကို ကာကွယ်ပေးမယ်။",
    "home.why.f1Title": "၁၀၀% စစ်မှန်မှု အာမခံချက်",
    "home.why.f1Body": "Techzy ကရောင်းတဲ့ Laptop တိုင်းဟာ Brand New အစစ်အမှန် မဟုတ်ခဲ့ရင် တန်ဖိုးရဲ့ (၂) ဆကို ပြန်လည်လျော်ပေးမယ့် အာမခံချက်ရှိပါတယ်။",
    "home.why.f2Title": "ရက် (၃၀) အတွင်း အသစ်လဲလှယ်ပေးခြင်း",
    "home.why.f2Body": "ဝယ်ယူပြီး (၁) လအတွင်းမှာ Factory Error တစ်ခုခု ပါခဲ့ရင် ပြင်ပေးတာမျိုးမဟုတ်ဘဲ အသစ်တစ်လုံး ချက်ချင်းလဲပေးမှာပါ!",
    "home.why.f3Title": "ပထမဦးဆုံး Unboxing အတွေ့အကြုံ",
    "home.why.f3Body": "ဘယ်သူမှ မဖောက်ရသေးတဲ့ Original Seal အပြည့်နဲ့ Laptop ကို ကိုယ်တိုင် ပထမဦးဆုံး ဖောက်ရမယ့် အတွေ့အကြုံကို ရမှာပါ။",
    "home.testimonials.title": "ဝယ်ယူသူများ၏ သုံးသပ်ချက်",
    "home.testimonials.subtitle": "တကယ့်ဝယ်သူများထံမှ တကယ့် feedback များ",

    "about.hero.kicker": "ကျွန်ုပ်တို့အကြောင်း",
    "about.hero.title": "ကွန်ပျူတာများကို မီနီမယ်လ်နည်းလမ်းနဲ့ ရွေးချယ်ရောင်းချခြင်း။",
    "about.hero.lede":
      "ယုံကြည်စိတ်ချရမှု၊ သန့်ရှင်းသောဒီဇိုင်း၊ တိတ်ဆိတ်သော စွမ်းဆောင်ရည်ကို ဦးစားပေးထားတဲ့ မော်ဒယ်များကိုသာ ရွေးချယ်ထားပါတယ်။",
    "about.beliefs.title": "ကျွန်ုပ်တို့ ယုံကြည်တာ",
    "about.beliefs.body":
      "နည်းပညာက နောက်ကွယ်မှာ နေသင့်ပါတယ်။ သင့်မက်ရှင်က လျင်မြန်၊ တည်ငြိမ်၊ သေသပ်ဖြစ်ရမယ်။",
    "about.beliefs.quote": "“စဉ်းစားစရာ မလိုအောင် အဆင်ပြေတဲ့ စပက်က တကယ်ကောင်းတာပါ।”",
    "about.beliefs.byline": "Techzy အဖွဲ့",
    "about.cards.qTitle": "အရည်အသွေး စစ်ဆေးမှု",
    "about.cards.qBody":
      "အပူချိန်၊ စွမ်းဆောင်ရည် တည်ငြိမ်မှု၊ နေ့စဉ်အသုံးပြုမှုအတွက် စမ်းသပ်အတည်ပြုထားပါတယ်။",
    "about.cards.pTitle": "ရိုးရှင်းတဲ့ စျေးနှုန်း",
    "about.cards.pBody": "ဖွံ့ဖြိုးထားတဲ့ ပက်ကေ့ချ် မရှုပ်ထွေး၊ များမားစွာ ဂျစ်မစ်မရှိ။",
    "about.cards.rTitle": "ပြုပြင်တိုးမြှင့်နိုင်မှု",
    "about.cards.rBody":
      "အသုံးတည့်ရာမှာ အဆင့်မြှင့်ခြင်း/ပြုပြင်ခြင်းကို ထောက်ပံ့ပြီး သက်တမ်းတိုးစေပါတယ်။",
    "about.how.title": "လုပ်ဆောင်ပုံ",
    "about.how.subtitle": "ရွေးချယ်မှုကနေ ပို့ဆောင်မှုအထိ ရိုးရှင်းတဲ့ လုပ်ငန်းစဉ်။",
    "about.steps.s1Title": "အမျိုးအစားရွေးပါ",
    "about.steps.s1Body": "လက်ပ်တော့၊ ဒက်စ်တော့၊ အပိုပစ္စည်းတွေကို တစ်နေရာတည်းက ကြည့်ရှုပါ။",
    "about.steps.s2Title": "စပက်/ဖွဲ့စည်းမှု ရွေးပါ",
    "about.steps.s2Body": "အလုပ်လုပ်ပုံနဲ့ ကိုက်ညီတဲ့ build ကို ရွေးချယ်ပါ။",
    "about.steps.s3Title": "အကူအညီ ရယူပါ",
    "about.steps.s3Body": "မေးမြန်းပါ၊ ကိုက်ညီမှုစစ်ပါ၊ ဝယ်ပြီးနောက် အကူအညီရယူပါ။",
    "about.cta.title": "ကြည့်ရှုရန် အဆင်သင့်လား",
    "about.cta.body": "မီနီမယ်လ် မက်ရှင်တွေကို အလွယ်တကူ ရွေးချယ်လိုက်ပါ။",
    "about.cta.button": "ထုတ်ကုန်များ ကြည့်ရန်",

    "products.hero.kicker": "ထုတ်ကုန်များ",
    "products.hero.title": "သန့်ရှင်းတဲ့ မက်ရှင်တွေ။ ရိုးရှင်းတဲ့ ရွေးချယ်မှု။",
    "products.hero.lede":
      "ရှာဖွေမှု၊ စစ်ထုတ်မှု၊ အစီအစဉ်ချခြင်းဖြင့် သင့်တော်တဲ့ မော်ဒယ်ကို ရှာပါ။",
    "products.filters.searchLabel": "ရှာဖွေ",
    "products.filters.searchPlaceholder": "ဥပမာ 16-inch, studio, RTX, ultralight",
    "products.filters.all": "အားလုံး",
    "products.filters.laptops": "လက်ပ်တော့များ",
    "products.filters.desktops": "ဒက်စ်တော့များ",
    "products.filters.accessories": "အပိုပစ္စည်းများ",
    "products.filters.sortLabel": "အစီအစဉ်",
    "products.sort.featured": "အကြံပြု",
    "products.sort.nameAsc": "အမည်: A မှ Z",
    "products.empty.title": "မကိုက်ညီတဲ့ ရလဒ်",
    "products.empty.body": "အခြား စကားလုံးနဲ့ စမ်းပါ၊ သို့မဟုတ် filter များကို ပြန်လည်သတ်မှတ်ပါ။",
    "products.empty.reset": "Filter ပြန်စတင်ရန်",
    "products.card.ask": "မေးမြန်းရန်",
    "products.card.buy": "ဝယ်/Quote",
    "products.card.askAria": "{name} အကြောင်း မေးမြန်းရန်",
    "products.card.buyAria": "{name} အတွက် Quote တောင်းရန်",

    "contact.hero.kicker": "ဆက်သွယ်ရန်",
    "contact.hero.title": "လူနဲ့ တိုက်ရိုက် ပြောကြည့်ပါ။",
    "contact.hero.lede":
      "စပက်၊ ပို့ဆောင်မှု၊ အာမခံ၊ သင့်တော်တဲ့ build ရွေးချယ်မှုအတွက် မေးမြန်းနိုင်ပါတယ်။",
    "contact.form.title": "စာပို့ရန်",
    "contact.form.subtitle":
      "ဒီဆိုက်က static ဖြစ်လို့ email app ကို ဖွင့်ပြီး စာကို အလိုအလျောက် ဖြည့်ပေးမှာပါ။",
    "contact.form.nameLabel": "နာမည်",
    "contact.form.emailLabel": "အီးမေးလ်",
    "contact.form.messageLabel": "စာ",
    "contact.form.messagePlaceholder":
      "လိုအပ်တာတွေကို ရေးပါ (အသုံးပြုရည်ရွယ်ချက်၊ ဘတ်ဂျက်၊ အရွယ်အစား စသည်)",
    "contact.form.submit": "Email ဖွင့်ရန်",
    "contact.form.reset": "ရှင်းလင်းရန်",
    "contact.form.direct": "သို့မဟုတ် တိုက်ရိုက် email ပို့ပါ:",
    "contact.aside.hoursTitle": "အချိန်",
    "contact.aside.hoursBody": "တနင်္လာ မှ သောကြာ, 9:00 မှ 18:00",
    "contact.aside.supportTitle": "အကူအညီ",
    "contact.aside.supportBody": "မော်ဒယ်အမည်နဲ့ အော်ဒါနံပါတ် (ရှိလျှင်) ထည့်ပါ။",
    "contact.aside.locationTitle": "တည်နေရာ",
    "contact.aside.locationBody":
      "နိုင်ငံတစ်ဝှမ်း ပို့ဆောင်ပေးသည်။ အချိန်နဲ့ ချိန်းဆိုပြီး လာယူနိုင်သည်။",

    "contact.err.name": "နာမည် ထည့်ပါ။",
    "contact.err.email": "မှန်ကန်တဲ့ အီးမေးလ် ထည့်ပါ။",
    "contact.err.message": "စာကို ထည့်ပါ။",
    "contact.mail.subject": "Techzy သို့ မေးမြန်းချက် ({name})",
    "contact.mail.footer": "Techzy ဝဘ်ဆိုက်မှ ပေးပို့ထားသည်။",
  },
};

let activeLang = "en";
let productsPageCtx = null;

function initMobileMenu() {
  const btn = qs("#navToggle");
  const nav = qs("#primaryNav");
  if (!btn || !nav) return;

  function setOpen(nextOpen) {
    const open = Boolean(nextOpen);
    document.body.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) btn.focus({ preventScroll: true });
  }

  btn.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("nav-open"));
  });

  // Close when selecting a link
  qsa("a", nav).forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  // Close on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Close when clicking the scrim (header ::after). We approximate by listening
  // for clicks on the document and checking if the menu is open and the click
  // is outside the nav + controls.
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (nav.contains(target) || btn.contains(target)) return;
    const lang = qs("#langToggle");
    if (lang && lang.contains(target)) return;
    setOpen(false);
  });

  // If resized to desktop, ensure it isn't stuck open.
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 561px)").matches) setOpen(false);
  });
}

function t(key, vars) {
  const dict = I18N[activeLang] || I18N.en;
  let out = dict[key] ?? I18N.en[key] ?? "";
  if (!out) return "";
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      out = out.replaceAll(`{${k}}`, String(v));
    });
  }
  return out;
}

function normalizeLang(l) {
  const s = String(l || "").toLowerCase();
  if (s.startsWith("my")) return "my";
  if (s.startsWith("mm")) return "my";
  return "en";
}

function getSavedLang() {
  return normalizeLang(window.localStorage.getItem("lang"));
}

function setSavedLang(lang) {
  window.localStorage.setItem("lang", normalizeLang(lang));
}

function applyI18n(lang) {
  activeLang = normalizeLang(lang);
  document.documentElement.lang = activeLang === "my" ? "my" : "en";

  qsa("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    const value = t(key);
    if (value) node.textContent = value;
  });

  qsa("[data-i18n-attr]").forEach((node) => {
    const raw = node.getAttribute("data-i18n-attr") || "";
    const parts = raw
      .split(/\s+/)
      .map((p) => p.trim())
      .filter(Boolean);

    parts.forEach((p) => {
      const idx = p.indexOf(":");
      if (idx === -1) return;
      const attr = p.slice(0, idx).trim();
      const key = p.slice(idx + 1).trim();
      if (!attr || !key) return;
      const value = t(key);
      if (value) node.setAttribute(attr, value);
    });
  });

  const toggle = qs("#langToggle");
  if (toggle) {
    toggle.textContent = activeLang === "my" ? "EN" : "MY";
  }
}

function initLanguageSwitcher() {
  const toggle = qs("#langToggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const next = activeLang === "my" ? "en" : "my";
    setSavedLang(next);
    applyI18n(next);
    // Re-render product grids so localized product copy updates.
    mountFeatured();
    if (productsPageCtx) productsPageCtx.render();
  });
}

const PRODUCTS = [
  {
    id: "asus-rog-strix-g16",
    name: "ASUS ROG Strix G16",
    nameMy: "ASUS ROG Strix G16",
    category: "laptop",
    badge: "ROG Gaming",
    badgeMy: "ROG Gaming",
    desc: "Powerhouse gaming laptop featuring the ROG Nebula Display, AMD Ryzen 9 processor and RTX 4080 GPU for unstoppable performance.",
    descMy: "ROG Nebula Display၊ AMD Ryzen 9 နှင့် RTX 4080 GPU ပါဝင်သော ထိပ်တန်း gaming laptop။",
    specs: ["RTX 4080 12GB", "AMD Ryzen 9 8945H", "32GB DDR5", "1TB NVMe SSD", "16\" QHD+ 240Hz"],
    specsMy: ["RTX 4080 12GB", "AMD Ryzen 9 8945H", "32GB DDR5", "1TB NVMe SSD", "16\" QHD+ 240Hz"],
    image: "ASUS ROG Strix16.png",
    featuredRank: 1,
  },
  {
    id: "asus-vivobook-v16",
    name: "Asus Vivobook V16",
    nameMy: "Asus Vivobook V16",
    category: "laptop",
    badge: "Everyday",
    badgeMy: "နေ့စဉ်အသုံး",
    desc: "Slim and versatile 16-inch laptop for students and professionals, with a large display and long battery life.",
    descMy: "ကျောင်းသားများနှင့် ပရော်ဖက်ရှင်နယ်များအတွက် ပါးလွှာပြီး ကြာရှည်ခံသော 16-inch laptop။",
    specs: ["Intel Core i5-13500H", "Intel Iris Xe Graphics", "16GB DDR5", "512GB NVMe SSD", "16\" FHD IPS"],
    specsMy: ["Intel Core i5-13500H", "Intel Iris Xe Graphics", "16GB DDR5", "512GB NVMe SSD", "16\" FHD IPS"],
    image: "Asus V16.png",
    featuredRank: 6,
  },
  {
    id: "asus-tuf-gaming-f16",
    name: "ASUS TUF Gaming F16",
    nameMy: "ASUS TUF Gaming F16",
    category: "laptop",
    badge: "TUF Gaming",
    badgeMy: "TUF Gaming",
    desc: "Military-grade durable gaming laptop with RTX 4060, 165Hz display and efficient Intel Core i7 for serious gamers.",
    descMy: "RTX 4060၊ 165Hz မျက်နှာပြင်နှင့် Intel Core i7 ပါဝင်သော စစ်တပ်အဆင့် ခိုင်ခံ့မှုရှိသော gaming laptop။",
    specs: ["RTX 4060 8GB", "Intel Core i7-13650HX", "16GB DDR5", "512GB NVMe SSD", "16\" FHD+ 165Hz"],
    specsMy: ["RTX 4060 8GB", "Intel Core i7-13650HX", "16GB DDR5", "512GB NVMe SSD", "16\" FHD+ 165Hz"],
    image: "TUF Gaming F16.png",
    featuredRank: 3,
  },
  {
    id: "acer-aspire-lite-15",
    name: "Acer Aspire Lite 15",
    nameMy: "Acer Aspire Lite 15",
    category: "laptop",
    badge: "Everyday",
    badgeMy: "နေ့စဉ်အသုံး",
    desc: "Lightweight everyday laptop for home, school and work. Fast SSD storage and a full-HD display make daily tasks effortless.",
    descMy: "အိမ်၊ ကျောင်းနှင့် အလုပ်အတွက် သင့်တော်သော ပေါ့ပါးသော laptop။ Fast SSD နှင့် Full-HD မျက်နှာပြင်ဖြင့် နေ့စဉ်လုပ်ငန်းများ လွယ်ကူစွာ ဆောင်ရွက်နိုင်သည်။",
    specs: ["Intel Core i5-12450H", "Intel UHD Graphics", "8GB DDR5", "512GB NVMe SSD", "15.6\" FHD IPS"],
    specsMy: ["Intel Core i5-12450H", "Intel UHD Graphics", "8GB DDR5", "512GB NVMe SSD", "15.6\" FHD IPS"],
    image: "acer aspire lite 15.png",
    featuredRank: 8,
  },
  {
    id: "acer-nitro-v15",
    name: "Acer Nitro V15",
    nameMy: "Acer Nitro V15",
    category: "laptop",
    badge: "Gaming",
    badgeMy: "ဂိမ်းဆော့ရန်",
    desc: "Entry-level gaming laptop with RTX 4050, 144Hz display and AMD Ryzen 5 — ideal for gamers on a budget.",
    descMy: "RTX 4050၊ 144Hz မျက်နှာပြင်နှင့် AMD Ryzen 5 ပါဝင်သော entry-level gaming laptop။",
    specs: ["RTX 4050 6GB", "AMD Ryzen 5 7535HS", "16GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    specsMy: ["RTX 4050 6GB", "AMD Ryzen 5 7535HS", "16GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    image: "acer nitro v15.png",
    featuredRank: 5,
  },
  {
    id: "asus-tuf-gaming-a16",
    name: "ASUS TUF Gaming A16",
    nameMy: "ASUS TUF Gaming A16",
    category: "laptop",
    badge: "TUF Gaming",
    badgeMy: "TUF Gaming",
    desc: "AMD-powered 16-inch gaming laptop with Radeon RX 7600S, built to handle demanding games and creative workflows.",
    descMy: "AMD Radeon RX 7600S ပါဝင်သော 16-inch gaming laptop၊ ကြမ်းတမ်းသော ဂိမ်းများနှင့် creative လုပ်ငန်းများအတွက် ဒီဇိုင်းထုတ်ထားသည်။",
    specs: ["Radeon RX 7600S 8GB", "AMD Ryzen 7 7745HX", "16GB DDR5", "512GB NVMe SSD", "16\" FHD 165Hz"],
    specsMy: ["Radeon RX 7600S 8GB", "AMD Ryzen 7 7745HX", "16GB DDR5", "512GB NVMe SSD", "16\" FHD 165Hz"],
    image: "asus tuf gaminga16.png",
    featuredRank: 4,
  },
  {
    id: "asus-expertbook-b9",
    name: "ASUS ExpertBook B9",
    nameMy: "ASUS ExpertBook B9",
    category: "laptop",
    badge: "Business",
    badgeMy: "စီးပွားရေး",
    desc: "Ultra-lightweight business laptop at under 1 kg, with enterprise-grade security, Intel Core Ultra and long battery life.",
    descMy: "1kg အောက် အလေးချိန်ရှိသော ultra-lightweight business laptop၊ enterprise security၊ Intel Core Ultra နှင့် ကြာရှည်ခံ battery ပါဝင်သည်။",
    specs: ["Intel Core Ultra 7 155U", "Intel Iris Xe Graphics", "32GB LPDDR5", "1TB NVMe SSD", "14\" OLED FHD"],
    specsMy: ["Intel Core Ultra 7 155U", "Intel Iris Xe Graphics", "32GB LPDDR5", "1TB NVMe SSD", "14\" OLED FHD"],
    image: "expertbook-b9.png",
    featuredRank: 9,
  },
  {
    id: "lenovo-legion-7-pro",
    name: "Lenovo Legion 7 Pro",
    nameMy: "Lenovo Legion 7 Pro",
    category: "laptop",
    badge: "Pro Gaming",
    badgeMy: "Pro Gaming",
    desc: "Top-of-the-line gaming laptop with a Mini LED display, RTX 4080 and AMD Ryzen 9 for elite competitive gaming.",
    descMy: "Mini LED မျက်နှာပြင်၊ RTX 4080 နှင့် AMD Ryzen 9 ပါဝင်သော ထိပ်တန်း gaming laptop။",
    specs: ["RTX 4080 12GB", "AMD Ryzen 9 7945HX", "32GB DDR5", "1TB NVMe SSD", "16\" QHD+ 240Hz Mini-LED"],
    specsMy: ["RTX 4080 12GB", "AMD Ryzen 9 7945HX", "32GB DDR5", "1TB NVMe SSD", "16\" QHD+ 240Hz Mini-LED"],
    image: "legion 7pro.png",
    featuredRank: 2,
  },
  {
    id: "lenovo-loq-15irx10",
    name: "Lenovo LOQ 15IRX10",
    nameMy: "Lenovo LOQ 15IRX10",
    category: "laptop",
    badge: "Gaming",
    badgeMy: "ဂိမ်းဆော့ရန်",
    desc: "Latest-gen Lenovo LOQ with RTX 4060 and Intel Core i7, delivering smooth gaming and productivity in a 15.6-inch chassis.",
    descMy: "RTX 4060 နှင့် Intel Core i7 ပါဝင်သော နောက်ဆုံးထွက် Lenovo LOQ gaming laptop။",
    specs: ["RTX 4060 8GB", "Intel Core i7-14650HX", "16GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    specsMy: ["RTX 4060 8GB", "Intel Core i7-14650HX", "16GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    image: "loq 15irx10.png",
    featuredRank: 7,
  },
  {
    id: "lenovo-loq-15irx9",
    name: "Lenovo LOQ 15IRX9",
    nameMy: "Lenovo LOQ 15IRX9",
    category: "laptop",
    badge: "Gaming",
    badgeMy: "ဂိမ်းဆော့ရန်",
    desc: "Affordable gaming powerhouse with RTX 4050 and Intel Core i5, offering a great entry point into PC gaming.",
    descMy: "RTX 4050 နှင့် Intel Core i5 ပါဝင်သော သင့်တော်သောစျေးနှုန်းဖြင့် gaming laptop။",
    specs: ["RTX 4050 6GB", "Intel Core i5-12450HX", "8GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    specsMy: ["RTX 4050 6GB", "Intel Core i5-12450HX", "8GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    image: "loq 15irx9.png",
    featuredRank: 10,
  },
  {
    id: "lenovo-ideapad-slim-3",
    name: "Lenovo IdeaPad Slim 3",
    nameMy: "Lenovo IdeaPad Slim 3",
    category: "laptop",
    badge: "Everyday",
    badgeMy: "နေ့စဉ်အသုံး",
    desc: "Thin and light everyday laptop with a Full HD display, fast AMD Ryzen processor and long-lasting battery — perfect for students and home users.",
    descMy: "Full HD မျက်နှာပြင်၊ AMD Ryzen processor နှင့် ကြာရှည်ခံ battery ပါဝင်သော ပေါ့ပါးသော everyday laptop — ကျောင်းသားများနှင့် အိမ်သုံးအတွက် အကောင်းဆုံး။",
    specs: ["AMD Ryzen 5 7520U", "AMD Radeon 610M", "8GB LPDDR5", "512GB NVMe SSD", "15.6\" FHD IPS"],
    specsMy: ["AMD Ryzen 5 7520U", "AMD Radeon 610M", "8GB LPDDR5", "512GB NVMe SSD", "15.6\" FHD IPS"],
    image: "lenovo ideapad slim 3.png",
    featuredRank: 99,
    productsOnly: true,
  },
  {
    id: "asus-tuf-gaming-a15",
    name: "ASUS TUF Gaming A15",
    nameMy: "ASUS TUF Gaming A15",
    category: "laptop",
    badge: "TUF Gaming",
    badgeMy: "TUF Gaming",
    desc: "Battle-tested 15.6-inch gaming laptop with RTX 4060, AMD Ryzen 7 and a 144Hz display for fluid gameplay.",
    descMy: "RTX 4060၊ AMD Ryzen 7 နှင့် 144Hz မျက်နှာပြင်ပါဝင်သော 15.6-inch gaming laptop။",
    specs: ["RTX 4060 8GB", "AMD Ryzen 7 7435HS", "16GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    specsMy: ["RTX 4060 8GB", "AMD Ryzen 7 7435HS", "16GB DDR5", "512GB NVMe SSD", "15.6\" FHD 144Hz"],
    image: "tuf gaming a15.png",
    featuredRank: 11,
  },
];

function getProductText(p) {
  const isMy = activeLang === "my";
  return {
    name: isMy ? p.nameMy || p.name : p.name,
    badge: isMy ? p.badgeMy || p.badge : p.badge,
    desc: isMy ? p.descMy || p.desc : p.desc,
    specs: isMy ? p.specsMy || p.specs : p.specs,
  };
}

function setActiveNav() {
  const path = (window.location.pathname || "").toLowerCase();
  const file = path.split("/").pop() || "index.html";
  const key = file.startsWith("about")
    ? "about"
    : file.startsWith("products")
      ? "products"
      : file.startsWith("contact")
        ? "contact"
        : "home";

  qsa(".nav a[data-nav]").forEach((a) => {
    if (a.dataset.nav === key) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function mountFooterBits() {
  const year = qs("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const btt = qs("#backToTop");
  if (btt) {
    btt.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function revealOnScroll() {
  const nodes = qsa("[data-reveal]");
  if (!nodes.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (ent.isIntersecting) ent.target.classList.add("is-visible");
      }
    },
    { threshold: 0.14 }
  );
  nodes.forEach((n) => io.observe(n));
}

function productCard(p) {
  const pt = getProductText(p);
  const wrap = document.createElement("article");
  wrap.className = "card product-card";
  wrap.setAttribute("data-cat", p.category);
  wrap.setAttribute("data-name", pt.name.toLowerCase());
  wrap.setAttribute("data-reveal", "1");

  if (p.image) {
    const imgWrap = document.createElement("div");
    imgWrap.className = "product-img-wrap";
    const img = document.createElement("img");
    img.src = `assets/images/products/${p.image}`;
    img.alt = pt.name;
    img.className = "product-img";
    img.loading = "lazy";
    imgWrap.appendChild(img);
    wrap.appendChild(imgWrap);
  }

  const top = document.createElement("div");
  top.className = "product-top";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = pt.badge;

  top.appendChild(badge);

  const body = document.createElement("div");
  body.className = "product-body";

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = pt.name;

  const desc = document.createElement("p");
  desc.className = "product-desc";
  desc.textContent = pt.desc;

  const specs = document.createElement("div");
  specs.className = "specs";
  pt.specs.slice(0, 4).forEach((s) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = s;
    specs.appendChild(pill);
  });

  const actions = document.createElement("div");
  actions.className = "product-actions";
  const details = document.createElement("a");
  details.className = "btn btn-ghost btn-small";
  details.href = "contact.html";
  details.textContent = t("products.card.ask");
  details.setAttribute(
    "aria-label",
    t("products.card.askAria", { name: pt.name })
  );

  const buy = document.createElement("a");
  buy.className = "btn btn-primary btn-small";
  buy.href = "contact.html";
  buy.textContent = t("products.card.buy");
  buy.setAttribute("aria-label", t("products.card.buyAria", { name: pt.name }));

  actions.appendChild(details);
  actions.appendChild(buy);

  body.appendChild(name);
  body.appendChild(desc);
  body.appendChild(specs);
  body.appendChild(actions);

  wrap.appendChild(top);
  wrap.appendChild(body);
  return wrap;
}

function mountFeatured() {
  const grid = qs("#featuredGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const featured = [...PRODUCTS]
    .filter((p) => !p.productsOnly)
    .sort((a, b) => a.featuredRank - b.featuredRank)
    .slice(0, 6);

  featured.forEach((p) => grid.appendChild(productCard(p)));
  revealOnScroll();
}

function mountProductsPage() {
  const grid = qs("#productsGrid");
  if (!grid) return;

  if (productsPageCtx) {
    productsPageCtx.render();
    return;
  }

  const search = qs("#productSearch");
  const empty = qs("#productsEmpty");
  const reset = qs("#resetFilters");

  let activeFilter = "all";
  let query = "";

  function getFiltered() {
    let list = PRODUCTS.slice();

    if (activeFilter !== "all")
      list = list.filter((p) => p.category === activeFilter);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        const pt = getProductText(p);
        const hay = `${pt.name} ${pt.badge} ${pt.desc} ${pt.specs.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }

    list.sort((a, b) => a.featuredRank - b.featuredRank);

    return list;
  }

  function render() {
    grid.innerHTML = "";
    const list = getFiltered();
    list.forEach((p) => grid.appendChild(productCard(p)));
    if (empty) empty.hidden = list.length !== 0;
    revealOnScroll();
  }

  qsa(".chip[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter || "all";
      qsa(".chip[data-filter]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render();
    });
  });

  if (search) {
    search.addEventListener("input", () => {
      query = search.value || "";
      render();
    });
  }

  if (reset) {
    reset.addEventListener("click", () => {
      activeFilter = "all";
      query = "";
      if (search) search.value = "";
      qsa(".chip[data-filter]").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.filter === "all");
      });
      render();
    });
  }

  productsPageCtx = { render };
  render();
}

function mountContactForm() {
  const form = qs("#contactForm");
  if (!form) return;

  const name = qs("#cName");
  const email = qs("#cEmail");
  const msg = qs("#cMsg");

  function setErr(id, message) {
    const help = qs(`[data-error-for="${id}"]`);
    if (!help) return;
    help.textContent = message || "";
    help.classList.toggle("is-error", Boolean(message));
  }

  function isValidEmail(v) {
    // Conservative check; this is for UX only.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const n = String(name?.value || "").trim();
    const em = String(email?.value || "").trim();
    const m = String(msg?.value || "").trim();

    setErr("cName", n ? "" : t("contact.err.name"));
    setErr("cEmail", isValidEmail(em) ? "" : t("contact.err.email"));
    setErr("cMsg", m ? "" : t("contact.err.message"));

    if (!n || !isValidEmail(em) || !m) return;

    const subject = encodeURIComponent(t("contact.mail.subject", { name: n }));
    const body = encodeURIComponent(
      `Name: ${n}\nEmail: ${em}\n\nMessage:\n${m}\n\n---\n${t("contact.mail.footer")}`
    );

    window.location.href = `mailto:sales@techzy.example?subject=${subject}&body=${body}`;
  });

  form.addEventListener("reset", () => {
    setErr("cName", "");
    setErr("cEmail", "");
    setErr("cMsg", "");
  });
}

function initCarousel() {
  const carousel = qs("#heroCarousel");
  if (!carousel) return;

  const slides = qsa(".carousel-slide", carousel);
  const dots = qsa(".carousel-dot", carousel);
  const total = slides.length;
  let active = 0;
  let autoTimer = null;

  function posClass(slideIdx) {
    const diff = ((slideIdx - active) % total + total) % total;
    if (diff === 0) return "is-active";
    if (diff === 1) return "is-next";
    return "is-prev";
  }

  function update() {
    slides.forEach((s, i) => {
      s.classList.remove("is-active", "is-next", "is-prev");
      s.classList.add(posClass(i));
    });
    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === active);
      d.setAttribute("aria-selected", String(i === active));
    });
  }

  function go(idx) {
    active = ((idx % total) + total) % total;
    update();
  }

  function next() { go(active + 1); }
  function prev() { go(active - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 4500);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  qs("#carouselNext", carousel)?.addEventListener("click", () => { stopAuto(); next(); startAuto(); });
  qs("#carouselPrev", carousel)?.addEventListener("click", () => { stopAuto(); prev(); startAuto(); });

  dots.forEach((d, i) => {
    d.addEventListener("click", () => { stopAuto(); go(i); startAuto(); });
  });

  // Swipe support
  let touchStartX = 0;
  carousel.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) { stopAuto(); dx > 0 ? next() : prev(); startAuto(); }
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);

  update();
  startAuto();
}

function mountTestimonials() {
  const track = qs("#testimonialsTrack");
  const prev = qs("#testimonialsPrev");
  const next = qs("#testimonialsNext");
  if (!track) return;

  const scrollBy = () => {
    const slide = track.querySelector(".testimonial-slide");
    return slide ? slide.offsetWidth + 16 : 300;
  };

  if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -scrollBy(), behavior: "smooth" }));
  if (next) next.addEventListener("click", () => track.scrollBy({ left: scrollBy(), behavior: "smooth" }));

  // Drag-to-scroll
  let isDragging = false, startX = 0, startScroll = 0;

  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    track.scrollLeft = startScroll - (e.pageX - startX);
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
    track.classList.remove("is-dragging");
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchmove", (e) => {
    const diff = touchStartX - e.touches[0].clientX;
    track.scrollLeft += diff * 0.6;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  const initial = getSavedLang() || normalizeLang(navigator.language);
  applyI18n(initial);
  initLanguageSwitcher();
  initMobileMenu();

  setActiveNav();
  mountFooterBits();
  initCarousel();
  mountFeatured();
  mountProductsPage();
  mountContactForm();
  mountTestimonials();

  // Basic reveal for any cards already on page
  qsa(".card, .feature, .step").forEach((n, i) => {
    if (!n.hasAttribute("data-reveal")) n.setAttribute("data-reveal", "1");
    n.style.transitionDelay = `${Math.min(i * 40, 220)}ms`;
  });
  revealOnScroll();
});
