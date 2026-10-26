/* legal-data.js — النصوص القانونية للمدونة (مصدر واحد يغذي الصفحات الأربع باللغتين)
   مكتوبة بصدق: تصف ما يحدث فعليًا في هذه المدونة — لا قوالب عامة مبالغ فيها */
(function () {
  "use strict";

  window.AA_LEGAL = {
    privacy: {
      title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
      sections: {
        ar: [
          { h: "نطاق هذه السياسة", body: ["تشرح هذه السياسة البيانات التي تجمعها ABDALLAH ABAS عند استخدامك للمدونة على النطاق blog.abdallahabas.com، وكيفية معالجتها. نلتزم بأقل قدر ممكن من جمع البيانات: لا نبيع بياناتك، ولا نشاركها لأغراض تسويقية، ولا نستخدم أدوات تتبع سلوك خارجية مفعّلة افتراضيًا."] },
          { h: "بيانات نموذج طلب الخدمة", body: ["عند إرسال طلب خدمة عبر صفحة التواصل نجمع: الاسم، البريد الإلكتروني، رقم الهاتف إن أدخلته، رابط موقعك إن أدخلته، الخدمة المطلوبة، ونص الطلب. هذه البيانات تُكتب في قاعدة بيانات Firebase Firestore المقدمة من Google، ولا يطّلع عليها إلا عبدالله عباس لغرض الرد على طلبك ومتابعته.", "لا تُستخدم هذه البيانات في قوائم بريدية ولا تُشارك مع أي طرف ثالث، ويُحتفظ بها طالما كان للطلب مأرب عملية."] },
          { h: "بيانات التعليقات", body: ["لنشر تعليق تحتاج حسابًا بصنعه بنفسك (بريد إلكتروني وكلمة مرور) عبر Firebase Authentication. نعرض الاسم المعروض ونص التعليق وتاريخه فقط — لا نعرض بريدك الإلكتروني للزوار أبدًا. يمكنك تعديل أو حذف تعليقاتك في أي وقت بنفسك، ويُحفظ لدينا مُعرّف حسابك (UID) لربط التعليقات بصاحبها.", "التعليقات المخالفة للقانون أو المزعجة يمكن حذفها من طرف إدارة المدونة دون إشعار مسبق."] },
          { h: "ما لا نجمعه", body: ["لا نجمع سجل تصفح تفصيلي، ولا نستخدم ملفات تتبع إعلانية، ولا ننشئ ملفًا تعريفيًا عنك. لا توجد إعلانات مفعّلة حاليًا في المدونة؛ وإن فُعّلت مستقبلًا (مثل Google AdSense) فسيُحدَّث هذا القسم بإشعار واضح في هذه الصفحة."] },
          { h: "التخزين المحلي في متصفحك", body: ["نستخدم localStorage في متصفحك لحفظ تفضيلات محضة: وضع العرض (ليلي/نهاري). هذه البيانات لا تُرسل إلى أي خادم ولا يمكن ربطها بهويتك."] },
          { h: "الأمان", body: ["الاتصال بالموقع مشفر عبر HTTPS، والبيانات المخزنة في Firebase مشفرة في السكون وفق معايير Google، والوصول إليها محكوم بقواعد أمان Firestore التي تمنع أي قراءة أو كتابة غير مصرح بها."] },
          { h: "حقوقك والتواصل", body: ["يمكنك طلب حذف بيانات طلب خدمة سابق أو حساب التعليقات الخاص بك بمراسلتنا على: abdallahabasabish@gmail.com وسنستجيب في وقت معقول."] }
        ],
        en: [
          { h: "Scope of this policy", body: ["This policy explains what data ABDALLAH ABAS (blog.abdallahabas.com) collects and how it is processed. We practice data minimization: we do not sell your data, do not share it for marketing, and do not enable third-party behavioral tracking by default."] },
          { h: "Service request data", body: ["When you submit a service request via the contact page we collect: your name, email, phone number (if provided), website link (if provided), requested service, and message body. This is written to a Firebase Firestore database (provided by Google) and is only accessed by ABDALLAH ABAS to reply to and follow up on your request.", "The data is never used for mailing lists nor shared with third parties, and is kept only while it remains operationally useful."] },
          { h: "Comment data", body: ["To post a comment you create your own account (email + password) through Firebase Authentication. We display your display name, comment text, and date only — your email is never shown to visitors. You can edit or delete your comments at any time yourself. We store your account UID to tie comments to their author.", "Illegal or abusive comments may be removed by the blog administration without prior notice."] },
          { h: "What we do NOT collect", body: ["No detailed browsing profiles, no advertising trackers, no behavioral profiling. There are currently no ads enabled on the blog; if that changes in the future (e.g., Google AdSense), this section will be updated with a clear notice on this page."] },
          { h: "Local storage on your device", body: ["We use localStorage purely for preferences: your light/dark theme choice. This never leaves your browser and cannot be tied to your identity."] },
          { h: "Security", body: ["The site is served over HTTPS, Firebase data is encrypted at rest per Google standards, and access is governed by Firestore security rules that block unauthorized reads and writes."] },
          { h: "Your rights & contact", body: ["You may request deletion of a previous service request or of your commenting account by emailing abdallahabasabish@gmail.com; we will respond within a reasonable time."] }
        ]
      }
    },

    terms: {
      title: { ar: "شروط الاستخدام", en: "Terms of Use" },
      sections: {
        ar: [
          { h: "قبول الشروط", body: ["باستخدامك ABDALLAH ABAS فأنت توافق على هذه الشروط. إن لم توافق عليها فالرجاء التوقف عن استخدام المدونة.", "قد نُحدّث هذه الشروط من وقت لآخر، والاستمرار في الاستخدام بعد التحديث يعني موافقتك على النسخة الأحدث."] },
          { h: "الملكية الفكرية", body: ["جميع المقالات والتصميمات الأصلية المنشورة هنا ملك لعبدالله عباس. يُسمح بالاقتباس المحدود مع ذكر المصدر صراحةً ووضع رابط لصفحة المقال الأصلية.", "يُمنع إعادة نشر المقالات كاملة أو ترجمتها أو بيعها دون إذن كتابي مسبق."] },
          { h: "الاستخدام المقبول", body: ["لا يجوز استخدام المدونة أو تعليقاتها لأي غرض غير قانوني، أو لنشر محتوى مسيء أو مضلل أو دعائي مزعج (سبام)، أو لمحاولة اختراق الموقع أو إساءة استهلاك موارده تقنيًا."] },
          { h: "التعليقات", body: ["التعليقات مساحة نقاش عامة تخص أصحابها. نحتفظ بحق حذف أي تعليق مخالف دون إشعار. عدم نشر بيانات شخصية حساسة في التعليقات — أنت مسؤول عما تنشره."] },
          { h: "الخدمات والتعاملات التجارية", body: ["عرض الخدمات داخل المدونة إعلان موجز فقط؛ أي تعاقد فعلي على خدمة يتم عبر التواصل المباشر ويخضع لاتفاق منفصل يُتفق عليه بين الطرفين (النطاق، المدة، السعر، التسليم).", "محتوى المقالات لا يُعد جزءًا من أي تعاقد ولا بديلًا عن استشارة مخصصة لحالتك."] },
          { h: "إخلاء المسؤولية والفصل", body: ["تُقدَّم المحتويات كما هي دون ضمانات، ويرجى مراجعة صفحة إخلاء المسؤولية المرفقة. إذا تضمنت أي بند هنا غير قابل للتنفيذ قانونيًا فيبقى بقية الشروط سارية."] },
          { h: "القانون الحاكم", body: ["تخضع هذه الشروط لقوانين جمهورية مصر العربية فيما يخص أي نزاع ينشأ عن استخدام المدونة، مع مراعاة قوانين حماية البيانات المعمول بها."] }
        ],
        en: [
          { h: "Acceptance", body: ["By using ABDALLAH ABAS you agree to these terms. If you do not agree, please stop using the blog.", "We may update these terms from time to time; continued use after an update means you accept the newer version."] },
          { h: "Intellectual property", body: ["All articles and original designs published here are owned by ABDALLAH ABAS. Limited quoting is allowed with explicit attribution and a link to the original article page.", "Republishing full articles, translating them, or selling them without prior written permission is prohibited."] },
          { h: "Acceptable use", body: ["You may not use the blog or its comments for any illegal purpose, to post abusive, misleading, or spammy content, or to attempt to hack or technically abuse the site's resources."] },
          { h: "Comments", body: ["Comments are a public discussion space owned by their authors. We reserve the right to remove any violating comment without notice. Do not post sensitive personal data in comments — you are responsible for what you publish."] },
          { h: "Services & commercial dealings", body: ["Service listings inside the blog are brief advertisements only; any actual service engagement happens via direct contact and is governed by a separate agreement between the parties (scope, duration, price, delivery).", "Article content is not part of any contract and is not a substitute for consulting tailored to your case."] },
          { h: "Disclaimer & severability", body: ["Content is provided as-is without warranties — see the accompanying disclaimer page. If any clause here is legally unenforceable, the remaining terms stay in effect."] },
          { h: "Governing law", body: ["These terms are governed by the laws of the Arab Republic of Egypt for any dispute arising from the use of the blog, with respect to applicable data protection laws."] }
        ]
      }
    },

    disclosure: {
      title: { ar: "إفصاح التابعية", en: "Affiliate Disclosure" },
      sections: {
        ar: [
          { h: "سياسة الصدق في المحتوى", body: ["ABDALLAH ABAS تكتب عن أدوات ومنصات وخدمات تخص الربح من الويب وبناء المواقع. التزامنا الواضح: لا نكتب عن شيء لم نجرّبه أو نراجعه فعليًا، ولا ندس توصيات بأجور."] },
          { h: "روابط العمولة — الوضع الحالي", body: ["لا توجد أي روابط عمولة (Affiliate) في المدونة اليوم. أي رابط تجده في المقالات هو رابط مباشر لعطاء المنصة أو مصدر المعلومة، ولا نربح شيئًا من نقرتك عليه.", "إن أُضيفت روابط عمولة مستقبلًا، فسيوضع إشعار صريح في أعلى كل مقال يحتويها، وسيُحدَّث هذا القسم — وهذا التزام مكتوب لا مجاملة."] },
          { h: "الإعلانات — الوضع الحالي", body: ["لا توجد إعلانات معروضة في المدونة حاليًا. عند تفعيل Google AdSense مستقبلًا ستظهر الوحدات الإعلانية ضمن مواضع معلنة في المقال، وتخضع لسياسات جوجل، وسنحدّث هذه الصفحة وقتها."] },
          { h: "المحتوى المدفوع والهدايا", body: ["لو نُشر يومًا مقال برعاية أو مقابل مادي فسيُوسم صراحةً بشعار (محتوى مدفوع/رعاية) في أعلى المقال. لا نقبل الهدايا أو المنتجات المجانية مقابل مراجعات إيجابية."] },
          { h: "خدماتي الخاصة", body: ["هناك تعارض مصالح واضح يجب أن تعرفه: أنا أقدم خدمات مدفوعة (تطوير مواقع، تجهيز ادسنس، سيو) — والمدونة تدعو إليها. مع ذلك، المحتوى التقني هنا صالح ومفيد بمفرده سواء تعاملت معي أم لا، ولن تجد مقالًا يُغرضك بخطوات ناقصة لإجبارك على شراء خدمة."] }
        ],
        en: [
          { h: "Honesty-first content policy", body: ["This blog writes about tools, platforms and services related to online monetization and web building. Our clear commitment: we never write about anything we have not actually tried or reviewed, and we never embed paid recommendations."] },
          { h: "Affiliate links — current status", body: ["There are NO affiliate links on the blog today. Every link you find in articles is a direct link to the platform or source, and we earn nothing from your clicks.", "If affiliate links are added in the future, a clear notice will appear at the top of every affected article and this section will be updated — that is a written commitment."] },
          { h: "Ads — current status", body: ["No ads are displayed on the blog currently. When Google AdSense is enabled in the future, ad units will appear within disclosed placements and this page will be updated accordingly."] },
          { h: "Sponsored content & gifts", body: ["If a sponsored or paid article is ever published, it will be explicitly labeled (sponsored content) at the top. We do not accept gifts or free products in exchange for positive reviews."] },
          { h: "My own services", body: ["One obvious conflict of interest you should know about: I sell services (web development, AdSense preparation, SEO) — and the blog promotes them. Still, the technical content here stands on its own whether you hire me or not, and you will never find an article withholding steps on purpose to force you into buying a service."] }
        ]
      }
    },

    disclaimer: {
      title: { ar: "إخلاء المسؤولية", en: "Disclaimer" },
      sections: {
        ar: [
          { h: "طبيعة المحتوى", body: ["كل ما يُنشر في ABDALLAH ABAS هو معلومات عامة وتجارب شخصية موثقة بأفضل ما يمكن، وليس استشارة مهنية أو قانونية أو مالية مخصصة لحالتك. القرار النهائي في أي خطوة تقنية أو استثمارية قرارك وحد."] },
          { h: "الأرباح — لا وعود", body: ["لا نضمن أي نتائج مالية من تطبيق ما نكتبه. الأرباح من ادسنس أو أي منصة تتوقف على عوامل خارج سيطرة أي مقال: جودة المحتوى، الحركة، السوق، وسياسات المنصة المتغيرة. أي أرقام تُذكر في المقالات إما أرقام رسمية من مصدرها أو من تجربة موثقة بسياقها — لا تُعمم أبدًا على حالتك.", "احذر من أي مصدر يعدك بأرباح مضمونة — في هذا المجال لا توجد أرباح مضمونة، وهذه المدونة لن تعدك بها أبدًا."] },
          { h: "دقة المعلومات وحداثتها", body: ["نبذل جهدًا معقولًا لدقة المعلومات وتحديثها، لكن المنصات تغير سياساتها وواجهاتها باستمرار. قد يصبح بعض التفاصيل قديمًا بعد النشر — لذلك تاريخ النشر والتحديث معروض في أعلى كل مقال، وتحقق دائمًا من المصدر الرسمي للمنصة قبل اتخاذ قرار مؤثر."] },
          { h: "الروابط الخارجية", body: ["المدونة تحوي روابط لمواقع خارجية (توثيق جوجل، أدوات، منصات) لفائدة القارئ. لا نتحكم في محتوى تلك المواقع ولا نتحمل مسؤولية سياساتها أو تغيراتها."] },
          { h: "حدود المسؤولية", body: ["لا يتحمل عبدالله عباس مسؤولية أي خسارة مباشرة أو غير مباشرة تنتج عن الاعتماد على محتوى المدونة، بما في ذلك — دون حصر — خسارة أرباح أو بيانات أو فرص. استخدم المحتوى كأساس تفهمه وتقرره بنفسك."] }
        ],
        en: [
          { h: "Nature of content", body: ["Everything published on ABDALLAH ABAS is general information and personally documented experience, not professional, legal, or financial advice tailored to your situation. The final decision on any technical or investment step is yours alone."] },
          { h: "Earnings — no promises", body: ["We guarantee no financial results from applying what we publish. Earnings from AdSense or any platform depend on factors outside any article's control: content quality, traffic, market, and changing platform policies. Any numbers mentioned are either official figures from their source or documented experiments with their context — never generalized to your case.", "Beware of any source promising guaranteed income — in this field there is no such thing, and this blog will never promise it to you."] },
          { h: "Accuracy & freshness", body: ["We make reasonable efforts to keep information accurate and updated, but platforms change policies and interfaces constantly. Some details may become outdated after publishing — publish/update dates are shown on every article, and you should always verify with the platform's official source before a consequential decision."] },
          { h: "External links", body: ["The blog links to external sites (Google docs, tools, platforms) for the reader's benefit. We do not control those sites and are not responsible for their policies or changes."] },
          { h: "Limitation of liability", body: ["ABDALLAH ABAS is not liable for any direct or indirect loss resulting from reliance on blog content, including — without limitation — loss of earnings, data, or opportunities. Use the content as a basis you understand and decide on yourself."] }
        ]
      }
    }
  };
})();
