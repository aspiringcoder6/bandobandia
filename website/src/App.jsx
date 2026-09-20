import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import products from "./data/products.json";

const NAV_ITEMS = [
  ["Trang chủ", "home"],
  ["Về Bản đồ bản địa", "story"],
  ["Bản làng Lùng Tám", "village"],
  ["Hành trình vải lanh", "journey"],
  ["Danh mục sản phẩm", "products"],
];

const VALID_ROUTES = new Set(NAV_ITEMS.map((item) => item[1]));
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=L%C3%B9ng+T%C3%A1m+Qu%E1%BA%A3n+B%E1%BA%A1+H%C3%A0+Giang";

function routeFromHash() {
  const route = window.location.hash.replace(/^#\/?/, "") || "home";
  return VALID_ROUTES.has(route) ? route : "home";
}

function navigate(page) {
  window.location.hash = page === "home" ? "#/" : `#/${page}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Brand() {
  return (
    <button className="brand" onClick={() => navigate("home")} aria-label="Về trang chủ">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      <span>BẢN ĐỒ<br />BẢN ĐỊA</span>
    </button>
  );
}

function Header({ page, onScan }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (next) => {
    setMenuOpen(false);
    navigate(next);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? "Đóng" : "Menu"}
        </button>
        <nav id="main-nav" className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Điều hướng chính">
          {NAV_ITEMS.map(([label, id]) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="header-scan" onClick={onScan}>Quét họa tiết</button>
      </div>
    </header>
  );
}

function ScannerModal({ open, onClose }) {
  const [stage, setStage] = useState("scanning");
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setStage("scanning");
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || stage !== "scanning") return undefined;
    const timer = window.setTimeout(() => setStage("result"), 1700);
    return () => window.clearTimeout(timer);
  }, [open, stage]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="scanner-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Đóng cửa sổ">×</button>
        <div className="scanner-visual">
          <p className="eyebrow">Bước 01 · Quét họa tiết</p>
          <h2 id="scanner-title">Đưa một hoa văn vào khung hình</h2>
          <div className={stage === "scanning" ? "phone-wrap is-scanning" : "phone-wrap"}>
            <img src="/assets/home/scan-phone.webp" alt="Điện thoại đang quét họa tiết trên vải lanh" />
            <span className="scan-line" aria-hidden="true" />
          </div>
          <p className="scan-status" aria-live="polite">
            {stage === "scanning" ? "Đang đối chiếu hoa văn…" : "Đã nhận diện họa tiết"}
          </p>
        </div>
        <div className={stage === "result" ? "scanner-result is-visible" : "scanner-result"} aria-hidden={stage !== "result"}>
          <p className="eyebrow">Bước 02 · Nhận thông điệp</p>
          <div className="motif-preview">
            <img src="/assets/home/new-pattern.webp" alt="Họa tiết hình thoi màu vàng trên nền chàm" />
          </div>
          <h3>Biểu tượng mâm cơm</h3>
          <dl>
            <div>
              <dt>Mô tả</dt>
              <dd>Mỗi ngày, gia đình người H’Mông lên nương rẫy, trở về khi mặt trời lặn. Trước đây, trong bữa cơm có sự phân biệt: bố và con trai ăn một mâm trước, phụ nữ ăn mâm riêng sau đó.</dd>
            </div>
            <div>
              <dt>Ý nghĩa</dt>
              <dd>Họa tiết thể hiện ước mong xóa bỏ sự phân biệt trong bữa cơm và gia đình, trở thành biểu tượng của sự đoàn kết, bình đẳng và sum vầy.</dd>
            </div>
          </dl>
          <blockquote>“Bữa cơm là nơi gia đình sum vầy, hãy trân trọng những khoảnh khắc được ở bên nhau.”</blockquote>
          <button className="text-button" onClick={() => setStage("scanning")}>Quét lại <span>→</span></button>
        </div>
      </section>
    </div>
  );
}

const featureCards = [
  { page: "story", label: "Giới thiệu chiến dịch", image: "/assets/campaign/drawing.webp" },
  { page: "village", label: "Bản làng Lùng Tám", image: "/assets/village/hero.webp" },
  { page: "journey", label: "Hành trình vải lanh", image: "/assets/journey/spin.webp" },
  { page: "products", label: "Danh mục sản phẩm", image: "/assets/journey/finished.webp" },
];

function Home({ onScan }) {
  return (
    <main>
      <section className="hero">
        <img className="hero-image" src="/assets/home/weaving-women.webp" alt="Hai phụ nữ H’Mông giới thiệu một tấm vải lanh chàm" />
        <div className="hero-shade" />
        <div className="hero-content page-shell">
          <p className="eyebrow light">Dệt lanh Lùng Tám · Dệt bản đồ, lưu bản sắc</p>
          <h1>Bản đồ<br />bản địa</h1>
          <p className="hero-lead">Khám phá ý nghĩa ẩn sau mỗi họa tiết trên tấm vải lanh của người H’Mông.</p>
          <button className="primary-button light-button" onClick={onScan}>Quét họa tiết ngay <span>→</span></button>
          <p className="hero-note">Mỗi tấm vải là một câu chuyện.</p>
        </div>
      </section>

      <section className="feature-grid page-shell" aria-label="Khám phá Bản đồ bản địa">
        {featureCards.map((card, index) => (
          <button className="feature-card" key={card.page} onClick={() => navigate(card.page)}>
            <img src={card.image} alt="" />
            <span className="card-number">0{index + 1}</span>
            <span className="card-title">{card.label}</span>
            <span className="card-arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </section>

      <section className="story-teaser">
        <div className="page-shell teaser-grid">
          <div className="teaser-copy">
            <p className="eyebrow">Câu chuyện bản sắc</p>
            <h2>Bản đồ bản địa</h2>
            <p>Mỗi hoa văn trên tấm vải là một thông điệp lưu giữ cách người H’Mông nhìn nhận thế giới, những giá trị họ trân trọng và ước vọng họ muốn truyền lại cho thế hệ sau.</p>
            <button className="primary-button dark-button" onClick={() => navigate("story")}>Tìm hiểu câu chuyện <span>→</span></button>
          </div>
          <div className="teaser-image-wrap">
            <img src="/assets/campaign/mountains.webp" alt="Thung lũng giữa núi đá Hà Giang" />
            <span className="location-label">Lùng Tám · Hà Giang</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function StoryPage({ onScan }) {
  return (
    <main className="inner-page story-page">
      <section className="editorial-hero">
        <div className="page-shell editorial-hero-grid">
          <div className="editorial-heading">
            <p className="eyebrow light">Giới thiệu chiến dịch</p>
            <h1>Những câu chuyện được dệt thành</h1>
            <p className="display-kicker">Bản đồ bản địa</p>
          </div>
          <div className="editorial-intro">
            <p>Nhằm giúp người trẻ có trải nghiệm sâu sắc và hiểu hơn về bản sắc của vải lanh H’Mông tại Lùng Tám, “Bản đồ bản địa” được xây dựng như một người chỉ dẫn bản địa, dẫn lối người trẻ khám phá những câu chuyện ẩn sau từng họa tiết được dệt, vẽ và lưu giữ trên tấm vải lanh.</p>
            <button className="primary-button light-button" onClick={onScan}>Thử quét một họa tiết <span>→</span></button>
          </div>
        </div>
      </section>

      <article className="story-body page-shell">
        <section className="story-block story-block-pattern">
          <div className="story-photo tall-photo">
            <img src="/assets/campaign/drawing.webp" alt="Nghệ nhân dùng bút vẽ sáp tạo hoa văn trên vải" />
          </div>
          <div className="story-copy">
            <p className="section-index">01</p>
            <p className="eyebrow">Hoa văn bản sắc</p>
            <h2>Ý nghĩa những hoa văn của người H’Mông</h2>
            <p>Trong văn hóa H’Mông, hoa văn trên trang phục không chỉ mang giá trị thẩm mỹ mà còn gắn với ký ức, đời sống, thiên nhiên và những giá trị cộng đồng. Theo các tư liệu dân gian, những câu chuyện về nguồn cội và hành trình của cộng đồng được lưu truyền qua nhiều thế hệ, trong đó hoa văn trở thành một cách để lưu giữ và biểu đạt những điều người H’Mông trân trọng.</p>
            <p>Những hình ảnh quen thuộc trong đời sống được chuyển hóa thành các họa tiết trên vải, tạo nên một hệ thống hoa văn mang đậm dấu ấn văn hóa. Mỗi họa tiết vì thế không chỉ là một nét trang trí, mà còn mở ra một câu chuyện về cách người H’Mông nhìn nhận thế giới và cuộc sống.</p>
          </div>
        </section>

        <section className="story-block story-block-hemp">
          <div className="story-copy">
            <p className="section-index">02</p>
            <p className="eyebrow">Sợi lanh trong đời sống</p>
            <h2>Câu chuyện về vải lanh H’Mông Lùng Tám</h2>
            <p>Với người H’Mông, cây lanh hiện diện trong nhiều dấu mốc của đời sống. Từ khi một đứa trẻ chào đời, lớn lên theo mẹ lên nương, đến khi người con gái về nhà chồng, vải lanh luôn gắn với những khoảnh khắc quan trọng của mỗi gia đình.</p>
            <p>Lanh không chỉ được dùng để làm trang phục mà còn mang những giá trị tinh thần sâu sắc. Sợi lanh gắn với đời sống, tâm linh, tình mẫu tử và sự khéo léo của người phụ nữ H’Mông. Việc trồng lanh, se sợi, dệt vải và vẽ hoa văn cũng là những kỹ năng được trao truyền qua nhiều thế hệ.</p>
            <blockquote>“Ở đâu có cây lanh, ở đó có người Mông.”</blockquote>
            <p>Từ một cây lanh nhỏ bé, qua hàng loạt công đoạn thủ công và sự kiên nhẫn của người thợ, một tấm vải được tạo nên - mang theo câu chuyện của con người và vùng đất nơi nó sinh ra.</p>
          </div>
          <div className="story-photo story-photo-pair">
            <img src="/assets/home/weaving-women.webp" alt="Những người phụ nữ H’Mông bên tấm vải lanh" />
            <img src="/assets/campaign/community.webp" alt="Cộng đồng H’Mông trong trang phục truyền thống" />
          </div>
        </section>
      </article>

      <section className="story-closing">
        <img src="/assets/campaign/mountains.webp" alt="Núi rừng Hà Giang" />
        <div className="story-closing-shade" />
        <div className="page-shell story-closing-copy">
          <p>Từ đó, “Bản đồ bản địa” mong muốn người trẻ bắt đầu từ một họa tiết, khám phá một câu chuyện và hiểu hơn về bản sắc văn hóa H’Mông được lưu giữ trên từng tấm vải lanh Lùng Tám.</p>
        </div>
      </section>
    </main>
  );
}

const destinations = [
  ["Nhà nghệ nhân Vàng Thị Mai", "/assets/village/artisan-vang-thi-mai.webp"],
  ["Không gian dệt lanh", "/assets/village/weaving-space.webp"],
  ["Ruộng bậc thang Lùng Tám", "/assets/village/terraces.webp"],
  ["Những nếp nhà trình tường", "/assets/village/village-homes.webp"],
  ["Đỉnh núi đôi Quản Bạ", "/assets/village/quan-ba.webp"],
];

function createItinerary(duration, interests, pace) {
  const wantsCraft = interests.includes("Trải nghiệm làng nghề");
  const wantsView = interests.includes("Săn cảnh đẹp");
  const wantsCulture = interests.includes("Hiểu văn hóa");
  const plan = [
    {
      time: "Buổi sáng",
      title: wantsCraft ? "Gặp người giữ sợi lanh" : "Chạm ngõ Lùng Tám",
      description: wantsCraft
        ? "Ghé không gian dệt, quan sát cách nối sợi và nghe nghệ nhân kể về những hoa văn quen thuộc."
        : "Bắt đầu bằng một vòng đi bộ chậm quanh bản để cảm nhận nhịp sống và địa hình thung lũng.",
    },
    {
      time: "Buổi trưa",
      title: "Dừng lại bên bữa cơm bản",
      description: "Dành thời gian nghỉ và thưởng thức bữa trưa địa phương trước khi tiếp tục hành trình.",
    },
    {
      time: "Buổi chiều",
      title: wantsView ? "Theo đường ruộng bậc thang" : wantsCulture ? "Qua những nếp nhà trình tường" : "Tự tay thử một công đoạn",
      description: wantsView
        ? "Đi theo các triền ruộng, chọn điểm nhìn rộng về núi Quản Bạ và trở lại bản khi nắng dịu."
        : wantsCulture
          ? "Quan sát kiến trúc, chuyện nhà và cách nghề lanh hiện diện trong đời sống thường ngày."
          : "Thử se sợi hoặc dệt một đoạn nhỏ dưới sự hướng dẫn tại làng nghề.",
    },
  ];

  if (duration === "2 ngày 1 đêm") {
    plan.push(
      {
        time: "Sáng ngày 02",
        title: wantsView ? "Đón sớm giữa đại ngàn" : "Trở lại khung cửi",
        description: wantsView
          ? "Khởi hành sớm về phía Quản Bạ, ngắm thung lũng và núi đôi trong ánh sáng đầu ngày."
          : "Dành buổi sáng để theo sâu hơn một công đoạn dệt hoặc nhuộm chàm.",
      },
      {
        time: "Chiều ngày 02",
        title: "Mang một câu chuyện về nhà",
        description: "Chọn một sản phẩm phù hợp, hỏi về người làm và câu chuyện của hoa văn trước khi rời Lùng Tám.",
      },
    );
  }

  if (pace === "Đi thật nhiều") {
    return plan.map((item) => ({ ...item, description: `${item.description} Kết hợp thêm một điểm dừng ngắn gần tuyến di chuyển.` }));
  }
  return plan;
}

function VillagePage() {
  const [duration, setDuration] = useState("1 ngày");
  const [interests, setInterests] = useState(["Trải nghiệm làng nghề"]);
  const [pace, setPace] = useState("Chậm & sâu");
  const [itinerary, setItinerary] = useState(null);

  const toggleInterest = (value) => {
    setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const weaveTrip = () => {
    const selected = interests.length ? interests : ["Trải nghiệm làng nghề"];
    setItinerary(createItinerary(duration, selected, pace));
    window.setTimeout(() => document.getElementById("itinerary-result")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
  };

  return (
    <main className="inner-page village-page">
      <section className="page-hero village-hero">
        <img src="/assets/village/hero.webp" alt="Thung lũng Lùng Tám giữa núi rừng" />
        <div className="page-hero-shade" />
        <div className="page-shell page-hero-copy">
          <p className="eyebrow light">Bản làng Lùng Tám</p>
          <h1>Một bản làng nhỏ giữa đại ngàn</h1>
          <p>Nơi những sợi lanh kể câu chuyện về con người, đất, thời gian và niềm tự hào bản sắc.</p>
          <a className="primary-button light-button" href="#village-intro">Khám phá Lùng Tám <span>↓</span></a>
        </div>
      </section>

      <section id="village-intro" className="village-intro page-shell">
        <div className="village-copy">
          <p className="eyebrow">Về Lùng Tám</p>
          <h2>Giữa đại ngàn, một bản làng dệt giấc mơ</h2>
          <p>Lùng Tám là nơi nghề dệt lanh của người H’Mông được gìn giữ qua nhiều thế hệ. Ở đây, lanh không chỉ là một chất liệu, mà gắn với nếp sống, ký ức và những kỹ nghệ được truyền lại trong cộng đồng.</p>
          <div className="travel-fact">
            <span>Từ trung tâm Hà Giang</span>
            <strong>Khoảng 50 km · 1,5 - 2 giờ</strong>
            <p>Di chuyển bằng ô tô hoặc xe máy theo QL4C → Quản Bạ → Lùng Tám.</p>
            <a href={MAPS_URL} target="_blank" rel="noreferrer">Xem chỉ đường trên Google Maps ↗</a>
          </div>
        </div>
        <figure className="village-intro-photo">
          <img src="/assets/village/between-mountains.webp" alt="Bản làng nằm giữa những dãy núi Hà Giang" />
          <figcaption>Lùng Tám, Quản Bạ, Hà Giang</figcaption>
        </figure>
      </section>

      <section className="destination-section">
        <div className="page-shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow light">Những điểm đến không thể bỏ lỡ</p>
              <h2>Năm lát cắt của Lùng Tám</h2>
            </div>
            <p>Đi qua những nơi nghề lanh, nếp nhà và cảnh quan cùng kể một câu chuyện.</p>
          </div>
          <div className="destination-strip">
            {destinations.map(([name, image], index) => (
              <article className="destination-card" key={name}>
                <img src={image} alt={name} loading="lazy" />
                <span>0{index + 1}</span>
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trip-planner page-shell">
        <div className="planner-heading">
          <p className="eyebrow">Gợi ý hành trình khám phá</p>
          <h2>Dệt hành trình của bạn</h2>
          <p>Mỗi người đến Lùng Tám với một điều khác nhau. Chọn những gì bạn muốn mang về, chúng tôi sẽ gợi một nhịp đi phù hợp.</p>
        </div>
        <div className="planner-panel">
          <fieldset>
            <legend>Bạn có bao nhiêu thời gian?</legend>
            {["1 ngày", "2 ngày 1 đêm"].map((option) => (
              <label className={duration === option ? "choice active" : "choice"} key={option}>
                <input type="radio" name="duration" checked={duration === option} onChange={() => setDuration(option)} />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Bạn muốn tìm điều gì?</legend>
            {["Trải nghiệm làng nghề", "Săn cảnh đẹp", "Hiểu văn hóa"].map((option) => (
              <label className={interests.includes(option) ? "choice active" : "choice"} key={option}>
                <input type="checkbox" checked={interests.includes(option)} onChange={() => toggleInterest(option)} />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Bạn muốn đi theo nhịp nào?</legend>
            {["Chậm & sâu", "Đi thật nhiều"].map((option) => (
              <label className={pace === option ? "choice active" : "choice"} key={option}>
                <input type="radio" name="pace" checked={pace === option} onChange={() => setPace(option)} />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <button className="primary-button dark-button planner-button" onClick={weaveTrip}>Dệt hành trình của riêng bạn <span>→</span></button>
        </div>

        {itinerary && (
          <div id="itinerary-result" className="itinerary-result" aria-live="polite">
            <div className="itinerary-title">
              <p className="eyebrow light">Hành trình đã dệt</p>
              <h3>{duration} · {pace}</h3>
              <p>{interests.length ? interests.join(" · ") : "Trải nghiệm làng nghề"}</p>
            </div>
            <ol>
              {itinerary.map((item) => (
                <li key={`${item.time}-${item.title}`}>
                  <span>{item.time}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </main>
  );
}

const journeySteps = [
  {
    number: "01",
    title: "Trồng và thu hoạch lanh",
    kicker: "Từ những mảnh nương giữa trời cao",
    image: "/assets/journey/harvest.webp",
    alt: "Người dân thu hoạch cây lanh trên nương",
    paragraphs: [
      "Cây lanh được gieo trồng trên những nương rẫy ở độ cao hơn 1.000m, nơi khí hậu mát mẻ và đất đai màu mỡ. Cây lanh lớn lên tự nhiên, không dùng hóa chất, nhờ bàn tay chăm bón và kinh nghiệm truyền đời của người H’Mông.",
      "Sau khoảng 4-5 tháng, khi thân lanh chuyển vàng, người dân thu hoạch thủ công, bó thành từng nắm, phơi nắng để giữ trọn độ bền của sợi.",
    ],
  },
  {
    number: "02",
    title: "Xử lý và se sợi",
    kicker: "Từ những thân lanh thô ráp đến sợi mảnh mai",
    image: "/assets/journey/spin.webp",
    alt: "Những sợi lanh đang được nối và se bằng tay",
    paragraphs: [
      "Thân lanh sau thu hoạch được tước vỏ, phơi khô, giã và rửa nhiều lần bằng nước suối để loại bỏ tạp chất, giúp sợi mềm và sạch hơn.",
      "Những sợi lanh nhỏ sau đó được nối lại bằng tay, rồi se thành sợi dài, đều và chắc. Công đoạn này đòi hỏi sự khéo léo, tỉ mỉ và đôi tay đã quen với sợi qua nhiều năm.",
    ],
  },
  {
    number: "03",
    title: "Dệt vải",
    kicker: "Theo nhịp khung cửi",
    image: "/assets/journey/weave.webp",
    alt: "Nghệ nhân H’Mông dệt vải trên khung cửi",
    paragraphs: [
      "Sợi lanh được đưa lên khung cửi gỗ và dệt hoàn toàn bằng tay. Từng nhịp thoi đưa, từng đường sợi đan xen, tấm vải dần hiện hình với kết cấu chắc chắn, bề mặt mộc mạc và tràn đầy sức sống.",
      "Đây là công đoạn đòi hỏi sự tập trung cao độ, bởi chỉ một sai lệch nhỏ cũng có thể ảnh hưởng đến cả tấm vải.",
    ],
  },
  {
    number: "04",
    title: "Nhuộm và tạo họa tiết",
    kicker: "Sắc màu từ thiên nhiên, hoa văn từ bàn tay",
    image: "/assets/journey/dye.webp",
    alt: "Những người phụ nữ H’Mông nhuộm vải chàm",
    paragraphs: [
      "Vải được nhuộm bằng lá chàm bản địa, qua nhiều lần ngâm, phơi để màu thấm dần và tạo nên sắc xanh trầm đặc trưng.",
      "Trên nền vải chàm, người nghệ nhân dùng sáp ong nóng và bút vẽ truyền thống để tạo nên những hoa văn mang đậm dấu ấn văn hóa H’Mông. Mỗi đường nét là kết tinh của kinh nghiệm, cảm quan thẩm mỹ và câu chuyện riêng của người làm.",
    ],
  },
];

function JourneyPage() {
  return (
    <main className="inner-page journey-page">
      <section className="page-hero journey-hero">
        <img src="/assets/journey/hero.webp" alt="Nghệ nhân tạo hoa văn trên tấm vải lanh" />
        <div className="page-hero-shade" />
        <div className="page-shell page-hero-copy">
          <p className="eyebrow light">Hành trình vải lanh</p>
          <h1>Từ những gì đất trời ban tặng</h1>
          <p>41 công đoạn, qua đôi bàn tay khéo léo, người H’Mông đã dệt nên tấm vải mang theo hơi thở của núi rừng, thời gian và một lối sống bền bỉ.</p>
          <a className="primary-button light-button" href="#journey-steps">Cuộn xuống để khám phá <span>↓</span></a>
        </div>
      </section>

      <section id="journey-steps" className="journey-steps page-shell">
        {journeySteps.map((step, index) => (
          <article className={index % 2 ? "journey-step reverse" : "journey-step"} key={step.number}>
            <div className="journey-step-image">
              <img src={step.image} alt={step.alt} loading="lazy" />
              <span>{step.number}</span>
            </div>
            <div className="journey-step-copy">
              <p className="eyebrow">Công đoạn {step.number}</p>
              <h2>{step.title}</h2>
              <h3>{step.kicker}</h3>
              {step.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
        ))}
      </section>

      <section className="journey-finish">
        <img src="/assets/journey/finished.webp" alt="Những tấm vải lanh chàm đã hoàn thiện" />
        <div className="journey-finish-shade" />
        <div className="page-shell journey-finish-copy">
          <p className="eyebrow light">Hoàn thiện thành phẩm</p>
          <h2>Một tấm vải, nhiều giá trị tiếp nối</h2>
          <p>Sau nhiều công đoạn, tấm vải lanh được hoàn thiện với bề mặt mềm hơn, hoa văn rõ nét và màu sắc hài hòa. Từ tấm vải, những sản phẩm như khăn, túi, áo được tạo ra, mang theo câu chuyện của đất, của người và của một nghề truyền thống vẫn đang được gìn giữ ở Lùng Tám.</p>
          <button className="primary-button light-button" onClick={() => navigate("products")}>Khám phá sản phẩm <span>→</span></button>
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(null);
  const total = product.images.length;
  const previous = () => setIndex((value) => (value - 1 + total) % total);
  const next = () => setIndex((value) => (value + 1) % total);

  const onTouchEnd = (event) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 38) delta < 0 ? next() : previous();
    touchStart.current = null;
  };

  return (
    <article className="product-card">
      <div
        className="product-carousel"
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={onTouchEnd}
      >
        <div className="product-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {product.images.map((image, imageIndex) => (
            <img
              key={image}
              src={image}
              alt={`${product.name}, góc nhìn ${imageIndex + 1}`}
              loading="lazy"
            />
          ))}
        </div>
        <button className="carousel-control previous" onClick={previous} aria-label={`Ảnh trước của ${product.name}`}>←</button>
        <button className="carousel-control next" onClick={next} aria-label={`Ảnh tiếp theo của ${product.name}`}>→</button>
        <span className="image-counter" aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
      <div className="product-meta">
        <h3>{product.name}</h3>
        <span>Vuốt để xem thêm ảnh</span>
      </div>
      <div className="carousel-dots" aria-hidden="true">
        {product.images.map((image, dotIndex) => <span className={dotIndex === index ? "active" : ""} key={image} />)}
      </div>
    </article>
  );
}

const productCategories = ["Trang phục", "Túi & phụ kiện", "Đồ thủ công"];

function ProductsPage() {
  const grouped = useMemo(() => productCategories.map((category) => ({
    category,
    items: products.filter((product) => product.category === category),
  })), []);

  return (
    <main className="inner-page products-page">
      <section className="catalog-hero">
        <img src="/assets/journey/finished.webp" alt="Vải lanh chàm Lùng Tám đã hoàn thiện" />
        <div className="catalog-hero-shade" />
        <div className="page-shell catalog-hero-copy">
          <p className="eyebrow light">Mang bản sắc vùng cao về bên mình</p>
          <h1>Danh mục<br />sản phẩm</h1>
          <p>18 mẫu sản phẩm từ vải lanh và bàn tay khéo léo của người H’Mông Lùng Tám. Chạm hoặc vuốt trên ảnh để xem từng góc nhìn.</p>
        </div>
      </section>

      <div className="catalog-content page-shell">
        {grouped.map((group, index) => (
          <section className="catalog-group" key={group.category}>
            <div className="catalog-group-heading">
              <span>0{index + 1}</span>
              <h2>{group.category}</h2>
              <p>{group.items.length} mẫu</p>
            </div>
            <div className="product-grid">
              {group.items.map((product) => <ProductCard product={product} key={product.id} />)}
            </div>
          </section>
        ))}
      </div>

      <section className="purchase-section">
        <div className="page-shell purchase-grid">
          <div className="purchase-image">
            <img src="/assets/village/village-homes.webp" alt="Những nếp nhà tại làng Lùng Tám" loading="lazy" />
          </div>
          <div className="purchase-copy">
            <p className="eyebrow">Thông tin nơi sản xuất / mua hàng</p>
            <h2>Đến Lùng Tám, gặp gỡ câu chuyện sau mỗi tấm vải</h2>
            <div className="purchase-facts">
              <div>
                <span>Nơi sản xuất</span>
                <strong>Hợp tác xã Lùng Tám</strong>
                <p>Xã Lùng Tám, huyện Quản Bạ, tỉnh Hà Giang</p>
              </div>
              <div>
                <span>Gợi ý mua hàng:</span>
                <strong>Đặt mua tại</strong>
                <div className="purchase-links">
                  <p>Fanpage: <a href="https://www.facebook.com/profile.php?id=100063601089739" target="_blank" rel="noreferrer">Làng dệt lanh thổ cẩm Lùng Tám Hà Giang</a></p>
                  <p>Fanpage: <a href="https://www.facebook.com/profile.php?id=100094653467670" target="_blank" rel="noreferrer">HTX Sản Xuất Vải Lanh Truyền Thống Hợp Tiến - Xã Lùng Tám</a></p>
                  <p>Tiktok: <a href="https://www.tiktok.com/@hmongbrocade2" target="_blank" rel="noreferrer">Hmongbrocade</a></p>
                </div>
              </div>
            </div>
            <a className="primary-button dark-button" href={MAPS_URL} target="_blank" rel="noreferrer">Xem bản đồ chỉ đường <span>↗</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <Brand />
        <p>Những câu chuyện được lưu giữ trên từng sợi lanh Lùng Tám.</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Lên đầu trang ↑</button>
      </div>
    </footer>
  );
}

function useWebMcp(openScanner) {
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return undefined;
    const lifecycle = new AbortController();
    const report = () => {};

    try {
      void Promise.resolve(context.registerTool({
        name: "open_pattern_scanner",
        title: "Mở trình quét họa tiết",
        description: "Mở trải nghiệm quét thử và hiển thị câu chuyện của họa tiết mâm cơm trên trang.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute() {
          navigate("home");
          openScanner();
          await new Promise((resolve) => window.setTimeout(resolve, 1800));
          return { status: "identified", motif: "Biểu tượng mâm cơm" };
        },
      }, { signal: lifecycle.signal })).catch(report);

      void Promise.resolve(context.registerTool({
        name: "navigate_cultural_story",
        title: "Mở một phần của Bản đồ bản địa",
        description: "Đi đến câu chuyện chiến dịch, bản làng Lùng Tám, hành trình vải lanh hoặc danh mục sản phẩm.",
        inputSchema: {
          type: "object",
          properties: { section: { type: "string", enum: ["story", "village", "journey", "products"] } },
          required: ["section"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || !["story", "village", "journey", "products"].includes(input.section)) {
            throw new Error("Phần nội dung không hợp lệ");
          }
          navigate(input.section);
          return { section: input.section, status: "opened" };
        },
      }, { signal: lifecycle.signal })).catch(report);
    } catch {
      return () => lifecycle.abort();
    }
    return () => lifecycle.abort();
  }, [openScanner]);
}

export default function App() {
  const [page, setPage] = useState(routeFromHash);
  const [scannerOpen, setScannerOpen] = useState(false);
  const openScanner = useCallback(() => setScannerOpen(true), []);
  const closeScanner = useCallback(() => setScannerOpen(false), []);

  useWebMcp(openScanner);

  useEffect(() => {
    const sync = () => setPage(routeFromHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const label = NAV_ITEMS.find((item) => item[1] === page)?.[0] || "Bản đồ bản địa";
    document.title = page === "home" ? "Bản đồ bản địa | Lùng Tám" : `${label} | Bản đồ bản địa`;
  }, [page]);

  let content;
  if (page === "story") content = <StoryPage onScan={openScanner} />;
  else if (page === "village") content = <VillagePage />;
  else if (page === "journey") content = <JourneyPage />;
  else if (page === "products") content = <ProductsPage />;
  else content = <Home onScan={openScanner} />;

  return (
    <>
      <Header page={page} onScan={openScanner} />
      {content}
      <Footer />
      <ScannerModal open={scannerOpen} onClose={closeScanner} />
    </>
  );
}
