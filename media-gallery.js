import PhotoSwipeLightbox from "./vendor/photoswipe/photoswipe-lightbox.esm.js";

let lightbox;

function syncImageDimensions(gallery) {
  for (const link of gallery.querySelectorAll("a.roboscopia-gallery-link")) {
    const image = link.querySelector("img");
    if (!image) continue;
    const sync = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        link.dataset.pswpWidth = String(image.naturalWidth);
        link.dataset.pswpHeight = String(image.naturalHeight);
      }
    };
    if (image.complete) sync();
    else image.addEventListener("load", sync, { once: true });
  }
}

export function init(root = document) {
  for (const gallery of root.querySelectorAll(".roboscopia-gallery")) {
    syncImageDimensions(gallery);
  }
  if (lightbox) return;
  lightbox = new PhotoSwipeLightbox({
    gallery: ".roboscopia-gallery",
    children: "a.roboscopia-gallery-link",
    pswpModule: () => import("./vendor/photoswipe/photoswipe.esm.js"),
    bgOpacity: 0.94,
    wheelToZoom: true
  });
  lightbox.init();
}
