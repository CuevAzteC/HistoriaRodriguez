const languageButtons = document.querySelectorAll("[data-language]");
const languageContent = document.querySelectorAll("[data-language-content]");
const localizedLabels = document.querySelectorAll("[data-label-es][data-label-en]");
const localizedImages = document.querySelectorAll("[data-alt-es][data-alt-en]");
const description = document.querySelector('meta[name="description"]');
const bookletTranscript = document.querySelector("#booklet-transcript");
const memoirChapterLinks = document.querySelector("#memoir-chapter-links");
const photoGrid = document.querySelector("#photo-grid");
const photoSearch = document.querySelector("#photo-search");
const photoYear = document.querySelector("#photo-year");
const photoCount = document.querySelector("#photo-count");
const photoDialog = document.querySelector("#photo-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogCaption = document.querySelector("#photo-dialog-caption");
const allYearOption = photoYear.querySelector('option[value="all"]');

let currentLanguage = "es";
let allPhotos = [];
let visiblePhotos = [];
let activePhotoCollection = [];
let activePhotoIndex = 0;
let bookletCache = {};

const inlinePhotoMoments = [
  {
    pattern: /Heliodoro Rodríguez Sarabia was born|Heliodoro Rodríguez Sarabia nació/i,
    photos: [{ src: "public/images/archive/used-pix/1923 - Aurelio Rodriguez Rivero tiene cargando a su hijo He.JPG", year: "1923", shape: "portrait", es: "Aurelio Rodríguez Rivero con su hijo Heliodoro", en: "Aurelio Rodríguez Rivero with his son Heliodoro", altEs: "Retrato de Aurelio Rodríguez Rivero con el pequeño Heliodoro", altEn: "Portrait of Aurelio Rodríguez Rivero holding young Heliodoro" }],
  },
  {
    pattern: /port of Veracruz|Puerto de Veracruz/i,
    photos: [{ src: "public/images/archive/dated/1944 - Veracruz Villa del Mar.JPG", year: "1944", shape: "landscape", es: "La familia durante el viaje a Veracruz", en: "The family on their trip to Veracruz", altEs: "La familia Rodríguez Sarabia durante el viaje a Veracruz de 1944", altEn: "The Rodríguez Sarabia family during their 1944 trip to Veracruz" }],
  },
  {
    pattern: /I met a young woman named Guillermina|conocí a una joven cuyo nombre es Guillermina/i,
    photos: [{ src: "public/images/archive/dated/1945 julio 15 - mina roldan.JPG", year: "1945", shape: "portrait", es: "Guillermina Roldán, 15 de julio de 1945", en: "Guillermina Roldán, July 15, 1945", altEs: "Retrato de Guillermina Roldán en 1945", altEn: "Portrait of Guillermina Roldán in 1945" }],
  },
  {
    pattern: /The house is at No\.|La casa esta ubicada/i,
    photos: [{ src: "public/images/archive/used-pix/1946 - La Casa de San Lorenzo cuando estaba la tienda.JPG", year: "1946", shape: "landscape", es: "La casa familiar cuando funcionaba la tienda", en: "The family home when it served as their shop", altEs: "Fachada de la casa familiar de San Lorenzo cuando allí estaba la tienda", altEn: "The family home in San Lorenzo when it housed their shop" }],
  },
  {
    pattern: /On a trip we made to Guadalajara in 1948|En un viaje que hicimos a Guadalajara en 1948/i,
    photos: [{ src: "public/images/archive/dated/en guadalajara - mina yola y helio.JPG", year: "1948", shape: "portrait", es: "Mina, Yola y Heliodoro en Guadalajara", en: "Mina, Yola, and Heliodoro in Guadalajara", altEs: "Guillermina, Yolanda y Heliodoro durante un viaje a Guadalajara", altEn: "Guillermina, Yolanda, and Heliodoro on a trip to Guadalajara" }],
  },
  {
    pattern: /Lic\. Rafael Monterota y Salceda|General Ignacio M\. Beteta/i,
    photos: [
      { src: "public/images/archive/used-pix/1952 - descubreindo la placa - inaguracion de la luz.JPG", year: "1952", shape: "landscape", es: "Descubrimiento de la placa por la inauguración de la luz", en: "Unveiling the plaque for the electricity inauguration", altEs: "Vecinos reunidos durante la inauguración del servicio eléctrico en San Lorenzo", altEn: "Residents at the inauguration of electricity service in San Lorenzo" },
      { src: "public/images/archive/used-pix/1952 junio - banquete inaguracion de la luz.JPG", year: "1952", shape: "landscape", es: "Banquete de inauguración, junio de 1952", en: "Inauguration banquet, June 1952", altEs: "Familiares y vecinos reunidos en el banquete de inauguración de la luz", altEn: "Family and neighbors gathered at the electricity inauguration banquet" },
    ],
  },
  {
    pattern: /My daughters Yolanda and Estela|Mis hijas, Yolanda y Estela/i,
    photos: [{ src: "public/images/archive/dated/1956 sep 16 - yola esltelita y aurelio.JPG", year: "1956", shape: "portrait", es: "Yolanda, Estela y Aurelio, 1956", en: "Yolanda, Estela, and Aurelio, 1956", altEs: "Yolanda, Estela y Aurelio en una fotografía escolar de 1956", altEn: "Yolanda, Estela, and Aurelio in a 1956 school photograph" }],
  },
  {
    pattern: /June 25, 1971|25 de junio.*1971|25 years of marriage|25 años de casados/i,
    photos: [{ src: "public/images/archive/dated/1971 julio 25 - bodas de plata 25 anos.JPG", year: "1971", shape: "landscape", es: "Bodas de plata, 25 de julio de 1971", en: "Silver anniversary, July 25, 1971", altEs: "Heliodoro y Guillermina celebran sus bodas de plata en 1971", altEn: "Heliodoro and Guillermina celebrate their silver anniversary in 1971" }],
  },
  {
    pattern: /^(?:Coral Anniversary|Bodas de Coral)(?:\s|$)/i,
    photos: [{ src: "public/images/archive/dated/1981 julio 25 - 35 aniversario.JPG", year: "1981", shape: "portrait", es: "Heliodoro y Guillermina, 35 años de casados", en: "Heliodoro and Guillermina, married 35 years", altEs: "Heliodoro y Guillermina en la celebración de su 35 aniversario", altEn: "Heliodoro and Guillermina at their 35th anniversary celebration" }],
  },
  {
    pattern: /Bishop of Texcoco|Obispo de Texcoco/i,
    photos: [{ src: "public/images/archive/used-pix/1990 marzo 4.JPG", year: "1990", shape: "landscape", es: "Envío de los ministros de la Eucaristía, 1990", en: "Commissioning of the Eucharistic ministers, 1990", altEs: "Heliodoro recibe la comunión durante la ceremonia de envío de ministros", altEn: "Heliodoro receives Communion during the ministers' commissioning ceremony" }],
  },
  {
    pattern: /July 25, 1996|1996.*Golden Anniversary|25 de julio.*1996|bodas de oro/i,
    photos: [{ src: "public/images/archive/dated/1996 julio 25 - 50 anos (3).JPG", year: "1996", shape: "landscape", es: "La familia en las bodas de oro, 25 de julio de 1996", en: "The family at the Golden Anniversary, July 25, 1996", altEs: "Varias generaciones de la familia reunidas en las bodas de oro", altEn: "Several generations of the family gathered for the Golden Anniversary" }],
  },
  {
    pattern: /July 25, 2001|2001.*55th anniversary|25 de julio.*2001|55º aniversario/i,
    photos: [{ src: "public/images/archive/dated/2001 julio 28 - 55 aniversario2.JPG", year: "2001", shape: "landscape", es: "La familia celebra 55 años de matrimonio, 2001", en: "The family celebrates 55 years of marriage, 2001", altEs: "Heliodoro y Guillermina rodeados por su familia en su 55 aniversario", altEn: "Heliodoro and Guillermina surrounded by family at their 55th anniversary" }],
  },
];

const memoirChapters = [
  { id: "family-record", start: /I finished writing this account|Esta escritura la terminé/i, es: "La familia en 2002", en: "Family in 2002" },
  { id: "early-years", start: /Heliodoro Rodríguez Sarabia was born|Heliodoro Rodríguez Sarabia nació/i, es: "Los primeros años", en: "Early years" },
  { id: "home-and-family", start: /In 1940 I met|En al año de 1940 conocí/i, es: "Guillermina y el hogar", en: "Guillermina and their home" },
  { id: "community-growth", start: /In 1950, while Mr\.|En el año de 1950 siendo Presidente Municipal/i, es: "Un pueblo que progresa", en: "A village at work" },
  { id: "community-service", start: /In January 1959|En el mes de enero de 1959/i, es: "Servicio a la comunidad", en: "Service to the community" },
  { id: "faith-and-care", start: /^1988[–-]1990$/, es: "Fe y acompañamiento", en: "Faith and care" },
  { id: "daily-life", start: /During the first years of our marriage|En los primeros años de mi matrimonio/i, es: "Trabajo y vida diaria", en: "Work and daily life" },
  { id: "later-years", start: /On July 25, 1996|En el 25 de julio de 1996/i, es: "Celebraciones y recuerdos", en: "Anniversaries and memories" },
];

const pageDescriptions = {
  es: "La historia de Heliodoro Rodríguez Sarabia y Guillermina Roldán, escrita para su familia en 2002.",
  en: "The story of Heliodoro Rodríguez Sarabia and Guillermina Roldán, written for their family in 2002.",
};

function setLanguage(language) {
  const languageKey = language === "en" ? "En" : "Es";
  currentLanguage = language;
  document.documentElement.lang = language;

  for (const content of languageContent) {
    content.hidden = content.dataset.languageContent !== language;
  }

  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  }

  for (const element of localizedLabels) {
    element.setAttribute("aria-label", element.dataset[`label${languageKey}`]);
  }

  for (const image of localizedImages) {
    image.alt = image.dataset[`alt${languageKey}`];
  }

  document.title = language === "es"
    ? "Heliodoro Rodríguez | Memoria de familia"
    : "Heliodoro Rodríguez | A Family Memoir";
  description.content = pageDescriptions[language];
  photoSearch.placeholder = language === "es" ? photoSearch.dataset.placeholderEs : photoSearch.dataset.placeholderEn;
  allYearOption.textContent = language === "es" ? "Todos los años" : "All years";
  localStorage.setItem("family-history-language", language);
  renderBooklet(language);
  renderPhotoGallery(language);
}

async function renderBooklet(language) {
  bookletTranscript.setAttribute("aria-busy", "true");

  try {
    if (!bookletCache[language]) {
      const response = await fetch(`public/booklet-${language}.txt`);
      if (!response.ok) throw new Error("Could not load the memoir text");
      bookletCache[language] = await response.text();
    }

    if (language !== currentLanguage) return;

    const text = bookletCache[language]
      .replace(/\r/g, "")
      .replace(/SHAPE\s+\\\*\s+MERGEFORMAT/gi, "")
      .replace(/\n(?=(?:Heliodoro Rodríguez S\.|Guillermina Roldán|Antes de iniciar|Before beginning|A esta fecha mi familia es la siguiente:|As of this date, my family is:|\d+\.\s|5 Yernos|4 Nueras|29 Nietos|16 Bisnietos|Total|Mi familia esta integrada|5 sons-in-law|4 daughters-in-law|29 grandchildren|16 great-grandchildren|In all, as of))/g, "\n\n")
      .replace(/\n[ \t]*(?=\d+\.\s|(?:President|Secretary|Treasurer|Presidente|Secretario|Tesorero)\s*[:–-])/g, "\n\n");
    const paragraphs = text.split(/\n\s*\n+|\n(?=\t)|\n(?=(?:19|20)\d{2}\s*(?:\n|$))/)
      .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const transcriptNodes = [];
    const chapterLinks = [];
    let activeChapter = null;

    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
      const paragraph = paragraphs[paragraphIndex];
      const chapterDefinition = memoirChapters.find((chapter) => chapter.start.test(paragraph));
      if (chapterDefinition) {
        const chapterNumber = chapterLinks.length + 1;
        activeChapter = document.createElement("section");
        activeChapter.className = "memoir-chapter";
        activeChapter.id = `memoir-${chapterDefinition.id}`;

        const chapterHeading = document.createElement("header");
        chapterHeading.className = "memoir-chapter-heading";
        const chapterNumberLabel = document.createElement("span");
        chapterNumberLabel.className = "memoir-chapter-number";
        chapterNumberLabel.textContent = String(chapterNumber).padStart(2, "0");
        const chapterTitle = document.createElement("h3");
        chapterTitle.textContent = chapterDefinition[language];
        chapterHeading.append(chapterNumberLabel, chapterTitle);
        activeChapter.append(chapterHeading);
        transcriptNodes.push(activeChapter);

        const chapterLink = document.createElement("a");
        chapterLink.href = `#${activeChapter.id}`;
        chapterLink.className = "memoir-chapter-link";
        const linkNumber = document.createElement("span");
        linkNumber.textContent = String(chapterNumber).padStart(2, "0");
        const linkTitle = document.createElement("span");
        linkTitle.textContent = chapterDefinition[language];
        chapterLink.append(linkNumber, linkTitle);
        chapterLinks.push(chapterLink);
      }

      if (!activeChapter) continue;

      if (activeChapter.id === "memoir-family-record" && /^\d+\.\s/.test(paragraph)) {
        const familyList = createFamilyList(paragraphs, paragraphIndex);
        activeChapter.append(familyList.element);
        paragraphIndex = familyList.nextIndex - 1;
        continue;
      }

      if (activeChapter.id === "memoir-family-record" && /^\d+\s+(?:Yernos|Nueras|Nietos|Bisnietos|sons-in-law|daughters-in-law|grandchildren|great-grandchildren)$/i.test(paragraph)) {
        const familyTotals = createFamilyTotals(paragraphs, paragraphIndex);
        activeChapter.append(familyTotals.element);
        paragraphIndex = familyTotals.nextIndex - 1;
        continue;
      }

      let textElement;
      if (/^(?:19|20)\d{2}(?:[–-](?:19|20)?\d{2})?$/.test(paragraph)) {
        textElement = document.createElement("p");
        textElement.className = "memoir-dateline";
      } else {
        textElement = document.createElement("p");
      }

      textElement.textContent = paragraph;
      if (/^(?:A esta fecha mi familia es la siguiente:|As of this date, my family is:)$/i.test(paragraph)) {
        textElement.className = "memoir-family-intro";
      }
      activeChapter.append(textElement);

      const photoMoment = inlinePhotoMoments.find((moment) => moment.pattern.test(paragraph));
      if (photoMoment) activeChapter.append(createInlinePhotoGroup(photoMoment, language));
    }

    bookletTranscript.replaceChildren(...transcriptNodes);
    memoirChapterLinks.replaceChildren(...chapterLinks);
  } catch {
    const message = document.createElement("p");
    message.textContent = language === "es" ? "No se pudo cargar el relato completo." : "The complete account could not be loaded.";
    bookletTranscript.replaceChildren(message);
  } finally {
    if (language === currentLanguage) bookletTranscript.setAttribute("aria-busy", "false");
  }
}

function createFamilyList(paragraphs, startIndex) {
  const list = document.createElement("ol");
  list.className = "memoir-family-list";
  let nextIndex = startIndex;

  while (nextIndex < paragraphs.length) {
    const match = paragraphs[nextIndex].match(/^(\d+)\.\s*(.+)$/);
    if (!match) break;

    const item = document.createElement("li");
    const number = document.createElement("span");
    number.className = "memoir-child-number";
    number.textContent = `${match[1]}.`;
    const name = document.createElement("span");
    name.textContent = match[2];
    item.append(number, document.createTextNode(" "), name);
    list.append(item);
    nextIndex += 1;
  }

  return { element: list, nextIndex };
}

function createFamilyTotals(paragraphs, startIndex) {
  const totals = document.createElement("div");
  totals.className = "memoir-family-totals";
  let nextIndex = startIndex;

  while (nextIndex < paragraphs.length) {
    const match = paragraphs[nextIndex].match(/^(\d+)\s+(.+)$/);
    if (!match || !/^(?:Yernos|Nueras|Nietos|Bisnietos|sons-in-law|daughters-in-law|grandchildren|great-grandchildren)$/i.test(match[2])) break;

    const stat = document.createElement("div");
    stat.className = "memoir-family-stat";
    const number = document.createElement("strong");
    number.textContent = match[1];
    const label = document.createElement("span");
    label.textContent = match[2];
    stat.append(number, label);
    totals.append(stat);
    nextIndex += 1;
  }

  let totalLabel = "";
  if (/^Total$/i.test(paragraphs[nextIndex] ?? "")) {
    totalLabel = paragraphs[nextIndex];
    nextIndex += 1;
  }

  if (/^(?:Mi familia esta integrada|In all, as of)/i.test(paragraphs[nextIndex] ?? "")) {
    const summary = document.createElement("div");
    summary.className = "memoir-family-total";
    if (totalLabel) {
      const label = document.createElement("span");
      label.textContent = totalLabel;
      summary.append(label);
    }
    const description = document.createElement("p");
    description.textContent = paragraphs[nextIndex];
    summary.append(description);
    totals.append(summary);
    nextIndex += 1;
  }

  return { element: totals, nextIndex };
}

function createInlinePhotoGroup(moment, language) {
  const gallery = document.createElement("div");
  gallery.className = "booklet-illustrations";
  gallery.dataset.count = String(moment.photos.length);
  gallery.setAttribute("role", "group");
  gallery.setAttribute("aria-label", language === "es" ? "Fotografías relacionadas con este recuerdo" : "Photographs related to this memory");

  gallery.append(...moment.photos.map((photo, index) => {
    const figure = document.createElement("figure");
    figure.className = "booklet-illustration";
    figure.dataset.crop = photo.shape;

    const button = document.createElement("button");
    button.className = "booklet-image-open";
    button.type = "button";
    button.setAttribute("aria-label", `${language === "es" ? "Ampliar fotografía" : "Enlarge photograph"}: ${photo[language]}`);

    const image = document.createElement("img");
    image.src = encodeURI(photo.src);
    image.alt = photo[`alt${language === "es" ? "Es" : "En"}`];
    image.loading = "lazy";
    image.decoding = "async";

    const caption = document.createElement("figcaption");
    const year = document.createElement("span");
    year.className = "photo-year";
    year.textContent = photo.year;
    const title = document.createElement("span");
    title.className = "photo-caption";
    title.textContent = photo[language];

    button.append(image);
    caption.append(year, title);
    figure.append(button, caption);
    button.addEventListener("click", () => openPhoto(index, moment.photos));
    return figure;
  }));

  return gallery;
}

function renderPhotoGallery(language) {
  if (!photoGrid || allPhotos.length === 0) return;

  const search = photoSearch.value.trim().toLocaleLowerCase();
  const year = photoYear.value;
  visiblePhotos = allPhotos.filter((photo) => {
    const matchesYear = year === "all" || photo.year === year;
    const searchableText = `${photo.sourceName} ${getPhotoCaption(photo, "es")} ${getPhotoCaption(photo, "en")} ${photo.year ?? ""}`;
    const matchesSearch = searchableText.toLocaleLowerCase().includes(search);
    return matchesYear && matchesSearch;
  });

  photoCount.textContent = language === "es"
    ? `${visiblePhotos.length} de ${allPhotos.length} fotografías`
    : `${visiblePhotos.length} of ${allPhotos.length} photographs`;

  if (visiblePhotos.length === 0) {
    const empty = document.createElement("p");
    empty.className = "photo-empty";
    empty.textContent = language === "es" ? "No hay fotografías para esta búsqueda." : "No photographs match this search.";
    photoGrid.replaceChildren(empty);
    return;
  }

  photoGrid.replaceChildren(...visiblePhotos.map((photo, index) => {
    const captionText = getPhotoCaption(photo, language);
    const figure = document.createElement("figure");
    figure.className = "photo-card";

    const button = document.createElement("button");
    button.className = "photo-open";
    button.type = "button";
    button.dataset.photoIndex = String(index);
    button.setAttribute("aria-label", `${language === "es" ? "Abrir fotografía" : "Open photograph"}: ${captionText}`);

    const image = document.createElement("img");
    image.src = encodeURI(photo.src);
    image.alt = `${language === "es" ? "Fotografía familiar" : "Family photograph"}: ${captionText}`;
    image.loading = "lazy";
    image.decoding = "async";

    const caption = document.createElement("figcaption");
    const yearLabel = document.createElement("span");
    yearLabel.className = "photo-year";
    yearLabel.textContent = photo.year ?? (language === "es" ? "Sin fecha" : "Undated");
    const descriptionLabel = document.createElement("span");
    descriptionLabel.className = "photo-caption";
    descriptionLabel.textContent = captionText;

    button.append(image);
    caption.append(yearLabel, descriptionLabel);
    figure.append(button, caption);
    return figure;
  }));
}

function openPhoto(index, collection = visiblePhotos) {
  activePhotoCollection = collection;
  activePhotoIndex = index;
  const photo = activePhotoCollection[activePhotoIndex];
  if (!photo) return;

  dialogImage.src = encodeURI(photo.src);
  const languageSuffix = currentLanguage === "es" ? "Es" : "En";
  const caption = getPhotoCaption(photo, currentLanguage);
  dialogImage.alt = photo[`alt${languageSuffix}`] ?? `${currentLanguage === "es" ? "Fotografía familiar" : "Family photograph"}: ${caption}`;
  dialogCaption.textContent = `${photo.year ? `${photo.year} · ` : ""}${caption}`;
  if (!photoDialog.open) photoDialog.showModal();
}

const photoCaptionCorrections = {
  "1923 - aurelio rodriguez rivero tiene cargando a su hijo he": { es: "Aurelio con Heliodoro de bebé", en: "Aurelio with baby Heliodoro" },
  "1944 - ranchito de la familia sarabia": { es: "El Ranchito de la familia Sarabia", en: "The Sarabia family ranch" },
  "1944 - veracruz (puerto) en el malecon": { es: "Malecón del puerto de Veracruz", en: "Veracruz port waterfront" },
  "1944 - veracruz villa del mar": { es: "Villa del Mar, Veracruz", en: "Villa del Mar, Veracruz" },
  "1945 julio 15 - mina roldan": { es: "Guillermina Roldán", en: "Guillermina Roldán" },
  "1956 boda - julio 25": { es: "Celebración familiar", en: "Family celebration" },
  "1956 sep 16 - yola esltelita y aurelio": { es: "Yolanda, Estela y Aurelio", en: "Yolanda, Estela, and Aurelio" },
  "1971 - bodas de plata mina y helio": { es: "Bodas de plata de Guillermina y Heliodoro", en: "Guillermina and Heliodoro's silver anniversary" },
  "1971 - bodas de plata": { es: "Celebración de bodas de plata", en: "Silver anniversary celebration" },
  "1971 julio 25 - bodas de plata 25 anos": { es: "Bodas de plata en San Lorenzo", en: "Silver anniversary in San Lorenzo" },
  "1980 - un domingoen el restaurant los hornos que esta por l": { es: "Domingo en el restaurante Los Hornos", en: "Sunday at Los Hornos Restaurant" },
  "1980 feb - puente internacional de nvo laredo": { es: "Puente internacional de Nuevo Laredo", en: "Nuevo Laredo International Bridge" },
  "1980 feb - el otro lado del puente de matamoros (lado americano)": { es: "Puente de Matamoros, lado estadounidense", en: "Matamoros Bridge, U.S. side" },
  "1981 feb - nasa houston tx": { es: "Centro espacial de Houston", en: "Houston Space Center" },
  "1981 feb 15 - nasa houston tx": { es: "Exhibición de la NASA en Houston", en: "NASA exhibit in Houston" },
  "1981 feb 15 - nasa houston tx(2)": { es: "Naves espaciales en Houston", en: "Spacecraft in Houston" },
  "1981 feb 25 - 35 aniversario": { es: "35 años de matrimonio", en: "35 years of marriage" },
  "1981 julio - 35 aniversario": { es: "Aniversario de coral", en: "Coral anniversary" },
  "1981 julio 25 - 35 aniversario": { es: "Heliodoro y Guillermina, 35 años juntos", en: "Heliodoro and Guillermina, 35 years together" },
  "1984 mayo - rio bravo nvo laredo": { es: "Río Bravo, Nuevo Laredo", en: "Rio Grande, Nuevo Laredo" },
  "1987 dec 25 - houston tx": { es: "Houston, Texas", en: "Houston, Texas" },
  "1987 marzo - transco tower": { es: "Torre Transco, Houston", en: "Transco Tower, Houston" },
  "1988 abril - alberca del club costa mar de acapulco": { es: "Alberca del Costa Mar, Acapulco", en: "Costa Mar pool, Acapulco" },
  "1988 abril - alberca del club costa mar de acapulco (2)": { es: "Costa Mar, Acapulco", en: "Costa Mar, Acapulco" },
  "1988 mayo - cd fronteriza de tapachula chiapas": { es: "Tapachula, ciudad fronteriza", en: "Tapachula, border city" },
  "1988 mayo - en las lagunas de montebello chiapas": { es: "Lagunas de Montebello, Chiapas", en: "Montebello Lakes, Chiapas" },
  "1988 mayo - frontera mexico guatemala": { es: "Frontera México–Guatemala", en: "Mexico–Guatemala border" },
  "1988 mayo - mirador del canon del suvirdero chiapas": { es: "Cañón del Sumidero, Chiapas", en: "Sumidero Canyon, Chiapas" },
  "1988 mayo - tapachula chiapas": { es: "Tapachula, Chiapas", en: "Tapachula, Chiapas" },
  "1996 julio 25 - 50 anos": { es: "Bodas de oro en familia", en: "Golden anniversary with family" },
  "1996 julio 25 - 50 anos (2)": { es: "Celebración de bodas de oro", en: "Golden anniversary celebration" },
  "1996 julio 25 - 50 anos (3)": { es: "La familia reunida por sus bodas de oro", en: "The family gathered for their golden anniversary" },
  "2001 julio 28 - 55 aniversario": { es: "55 años de matrimonio", en: "55 years of marriage" },
  "2001 julio 28 - 55 aniversario2": { es: "La familia celebra el aniversario", en: "The family celebrates the anniversary" },
  "veracruz regreso en los limites del edo de puebla - 1944": { es: "Regreso del viaje a Veracruz", en: "Return from the Veracruz trip" },
  "en guadalajara - mina concha y yola": { es: "Mina, Concha y Yolanda en Guadalajara", en: "Mina, Concha, and Yolanda in Guadalajara" },
  "en guadalajara - mina y yola": { es: "Mina y Yolanda en Guadalajara", en: "Mina and Yolanda in Guadalajara" },
  "en guadalajara - mina yola y helio": { es: "Mina, Yolanda y Heliodoro en Guadalajara", en: "Mina, Yolanda, and Heliodoro in Guadalajara" },
  "58 aniversario": { es: "Celebración de aniversario", en: "Anniversary celebration" },
  "bisabuelos 1": { es: "Retrato de los bisabuelos", en: "Great-grandparents' portrait" },
  "bisabuelos 2": { es: "Retrato de los bisabuelos", en: "Great-grandparents' portrait" },
  "cap. gregorio roldan y natalia gonzalez": { es: "Gregorio Roldán y Natalia González", en: "Gregorio Roldán and Natalia González" },
  "monja 1": { es: "Retrato de una religiosa", en: "Portrait of a nun" },
  "monja 2": { es: "Retrato de una religiosa", en: "Portrait of a nun" },
  "nata": { es: "Retrato de Nata", en: "Portrait of Nata" },
  "yola, estelita, aurelio, bety, eugenia y heliodoro": { es: "Seis hermanos de la familia Rodríguez", en: "Six Rodríguez siblings" },
  "1943 - primer coche": { es: "El primer automóvil", en: "The first car" },
  "1946 - la casa de san lorenzo cuando estaba la tienda": { es: "La casa familiar y la tienda", en: "The family home and shop" },
  "1946 - en la casa paterna": { es: "En la casa paterna", en: "At the family home" },
  "1948 octubre - maria artemia": { es: "María y Artemia", en: "María and Artemia" },
  "1952 - descubreindo la placa - inaguracion de la luz": { es: "Inauguración de la electricidad en San Lorenzo", en: "Electricity inauguration in San Lorenzo" },
  "1952 - un poco antes del descubrimiento de la placa comnemo": { es: "Preparativos para la inauguración de la luz", en: "Preparations for the electricity inauguration" },
  "1952 junio - banquete inaguracion de la luz": { es: "Banquete de inauguración", en: "Inauguration banquet" },
  "1955 - iglesia de san lorenzo": { es: "Iglesia de San Lorenzo", en: "San Lorenzo Church" },
  "1974 - reparacion de la casa de san lorenzo": { es: "Reparaciones en la casa de San Lorenzo", en: "Repairs to the San Lorenzo home" },
  "1990 marzo 4": { es: "Envío de los ministros de la Eucaristía", en: "Commissioning of the Eucharistic ministers" },
  "1990 marzo 4 (2)": { es: "Ceremonia de los ministros de la Eucaristía", en: "Eucharistic ministers ceremony" },
  "1993 dic 8 - en la casa de concha el dia de su santo": { es: "Día de santo en casa de Concha", en: "Saint's day at Concha's home" },
};

const captionMonthPattern = "(?:enero|ene|febrero|feb|marzo|mar|abril|abr|mayo|may|junio|jun|julio|jul|agosto|ago|septiembre|setiembre|sept|sep|octubre|oct|noviembre|nov|diciembre|dic|january|jan|february|march|mar|april|apr|june|jun|july|jul|august|aug|september|sept|october|oct|november|nov|december|dec)";

function normalizeCaptionKey(filename) {
  return filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/\.[^.]+$/, "").replace(/\s+/g, " ").trim();
}

function formatPhotoCaption(filename) {
  const normalizedFilename = filename.normalize("NFC").replace(/\.[^.]+$/, "").replace(/\s+/g, " ").trim();
  const correction = photoCaptionCorrections[normalizeCaptionKey(normalizedFilename)];
  if (correction) return correction;

  const datePrefix = new RegExp(`^(?:19|20)\\d{2}(?:\\s+${captionMonthPattern}\\.?(?:\\s+\\d{1,2})?)?\\s*[-–]\\s*`, "i");
  const dateInCaption = new RegExp(`\\b${captionMonthPattern}\\.?\\s+\\d{1,2}\\b`, "gi");
  let caption = normalizedFilename
    .replace(datePrefix, "")
    .replace(/^(?:19|20)\d{2}\s+/, "")
    .replace(dateInCaption, "")
    .replace(/\b(?:19|20)\d{2}\b/g, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s*[-–]\s*/g, " · ")
    .replace(/\s+/g, " ")
    .replace(/^(?:·\s*)+|(?:\s*·)+$/g, "")
    .trim();

  if (!caption) return { es: "Fotografía familiar", en: "Family photograph" };

  const titleCase = (language) => {
    const particles = language === "es"
      ? new Set(["a", "al", "con", "de", "del", "el", "en", "la", "las", "los", "por", "y"])
      : new Set(["a", "an", "and", "at", "by", "for", "in", "of", "the", "to"]);
    return caption.split(/(\s+)/).map((word, index) => {
      if (!word.trim()) return word;
      const lower = word.toLocaleLowerCase(language);
      if (index > 0 && particles.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase(language) + lower.slice(1);
    }).join("");
  };

  return { es: titleCase("es"), en: titleCase("en") };
}

function getPhotoCaption(photo, language) {
  if (photo.caption && typeof photo.caption === "object") return photo.caption[language] ?? photo.caption.es;
  return photo[language] ?? photo.caption ?? "";
}

async function loadPhotos() {
  try {
    const response = await fetch("public/images/archive/photos.json");
    if (!response.ok) throw new Error("Could not load the photo archive");
    const paths = await response.json();
    allPhotos = paths.map((src) => {
      const normalizedSrc = src.normalize("NFC");
      const filename = decodeURIComponent(normalizedSrc.split("/").pop()).normalize("NFC");
      const year = filename.match(/(?:19|20)\d{2}/)?.[0] ?? null;
      return { src: normalizedSrc, year, sourceName: filename.replace(/\.[^.]+$/, ""), caption: formatPhotoCaption(filename) };
    }).sort((first, second) => (first.year ?? "9999").localeCompare(second.year ?? "9999") || getPhotoCaption(first, currentLanguage).localeCompare(getPhotoCaption(second, currentLanguage)));

    const years = [...new Set(allPhotos.map((photo) => photo.year).filter(Boolean))].sort();
    for (const year of years) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      photoYear.append(option);
    }

    renderPhotoGallery(currentLanguage);
  } catch {
    photoGrid.textContent = currentLanguage === "es" ? "No se pudo cargar el archivo fotográfico." : "The photo archive could not be loaded.";
  }
}

photoSearch.addEventListener("input", () => renderPhotoGallery(currentLanguage));
photoYear.addEventListener("change", () => renderPhotoGallery(currentLanguage));
photoGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo-index]");
  if (button) openPhoto(Number(button.dataset.photoIndex));
});

photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});

document.querySelector("[data-dialog-close]").addEventListener("click", () => photoDialog.close());

document.querySelectorAll("[data-photo-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.photoStep === "next" ? 1 : -1;
    const nextIndex = (activePhotoIndex + direction + activePhotoCollection.length) % activePhotoCollection.length;
    openPhoto(nextIndex, activePhotoCollection);
  });
});

for (const button of languageButtons) {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
}

const savedLanguage = localStorage.getItem("family-history-language");
setLanguage(savedLanguage === "en" ? "en" : "es");
loadPhotos();