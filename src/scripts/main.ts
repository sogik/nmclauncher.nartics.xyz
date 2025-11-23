// Interfaces TS
interface GitHubAsset {
  name: string;
  browser_download_url: string;
}
interface GitHubRelease {
  tag_name: string;
  html_url: string;
  assets: GitHubAsset[];
}

document.addEventListener("DOMContentLoaded", async function () {
  // --- 1. TEMA LOGIC ---
  const toggleBtn = document.getElementById("theme-toggle");
  const iconSun = document.getElementById("icon-sun");
  const iconMoon = document.getElementById("icon-moon");
  const htmlEl = document.documentElement;

  if (localStorage.getItem("theme") === "light") {
    htmlEl.setAttribute("data-theme", "light");
    if (iconSun) iconSun.style.display = "none";
    if (iconMoon) iconMoon.style.display = "block";
  } else {
    if (iconSun) iconSun.style.display = "block";
    if (iconMoon) iconMoon.style.display = "none";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (htmlEl.getAttribute("data-theme") === "light") {
        htmlEl.removeAttribute("data-theme");
        localStorage.setItem("theme", "dark");
        if (iconSun) iconSun.style.display = "block";
        if (iconMoon) iconMoon.style.display = "none";
      } else {
        htmlEl.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        if (iconSun) iconSun.style.display = "none";
        if (iconMoon) iconMoon.style.display = "block";
      }
    });
  }

  // --- 2. OS DETECT ---
  var userAgent = navigator.userAgent.toLowerCase();
  var os = "windows";
  if (userAgent.includes("android")) os = "android";
  else if (userAgent.includes("mac")) os = "macos";
  else if (userAgent.includes("linux")) os = "linux";

  // Detección de ARM
  const isArm =
    userAgent.includes("arm") || userAgent.includes("aarch64");

  document
    .querySelectorAll(".dl-card")
    .forEach((c) => c.classList.remove("recommended"));
  const targetCard = document.getElementById("card-" + os);
  if (targetCard) targetCard.classList.add("recommended");
  else {
    const defCard = document.getElementById("card-windows");
    if (defCard) defCard.classList.add("recommended");
  }

  // --- 3. GITHUB FETCH ---
  const repo = "sogik/NMCLauncher";
  const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

  fetch(apiUrl)
    .then((r) => r.json())
    .then((data: GitHubRelease) => {
      const tag = data.tag_name;
      const assets = data.assets;

      const notifLink = document.getElementById(
        "notification-link"
      ) as HTMLAnchorElement;
      if (notifLink) {
        notifLink.textContent = `NMCLauncher ${tag} has been released!`;
        notifLink.href = data.html_url;
      }

      ["win", "mac", "lin"].forEach((k) => {
        const el = document.getElementById("ver-" + k);
        if (el) el.innerText = "Version " + tag;
      });

      // FILTROS
      const isArmFile = (name: string) => name.match(/arm64|aarch64/i);
      const isX86File = (name: string) => !isArmFile(name);

      // WINDOWS
      let winSetup, winPort;
      if (isArm) {
        winSetup = assets.find((a) =>
          a.name.match(/arm64.*setup.*\.exe/i)
        );
        winPort = assets.find((a) =>
          a.name.match(/arm64.*portable.*\.zip/i)
        );
      }
      if (!winSetup) {
        winSetup =
          assets.find(
            (a) =>
              a.name.match(/msvc.*setup.*\.exe/i) && isX86File(a.name)
          ) ||
          assets.find(
            (a) => a.name.match(/setup.*\.exe/i) && isX86File(a.name)
          );
      }
      if (!winPort) {
        winPort =
          assets.find(
            (a) =>
              a.name.match(/msvc.*portable.*\.zip/i) && isX86File(a.name)
          ) ||
          assets.find(
            (a) => a.name.match(/portable.*\.zip/i) && isX86File(a.name)
          );
      }

      if (winSetup) {
        const btn = document.getElementById(
          "btn-win-setup"
        ) as HTMLAnchorElement;
        if (btn) {
          btn.href = winSetup.browser_download_url;
          btn.classList.remove("hidden");
        }
      }
      if (winPort) {
        const btn = document.getElementById(
          "btn-win-port"
        ) as HTMLAnchorElement;
        if (btn) {
          btn.href = winPort.browser_download_url;
          btn.classList.remove("hidden");
        }
      }

      // LINUX (AppImage & tar.gz)
      let linApp, linTar;
      if (isArm) {
        linApp = assets.find(
          (a) => a.name.match(/\.AppImage/i) && isArmFile(a.name)
        );
        linTar = assets.find(
          (a) =>
            (a.name.match(/linux.*\.tar\.gz/i) ||
              a.name.match(/linux.*\.zip/i)) &&
            isArmFile(a.name)
        );
      } else {
        linApp = assets.find(
          (a) => a.name.match(/\.AppImage/i) && isX86File(a.name)
        );
        linTar = assets.find(
          (a) =>
            (a.name.match(/linux.*\.tar\.gz/i) ||
              a.name.match(/linux.*\.zip/i)) &&
            isX86File(a.name)
        );
      }

      if (linApp) {
        const btn = document.getElementById(
          "btn-lin-appimage"
        ) as HTMLAnchorElement;
        if (btn) {
          btn.href = linApp.browser_download_url;
          btn.classList.remove("hidden");
        }
      }
      if (linTar) {
        const btn = document.getElementById(
          "btn-lin-tar"
        ) as HTMLAnchorElement;
        if (btn) {
          btn.href = linTar.browser_download_url;
          btn.classList.remove("hidden");
        }
      }

      // MAC
      let macFile =
        assets.find((a) => a.name.match(/\.dmg/i)) ||
        assets.find((a) => a.name.match(/macos.*\.zip/i));
      if (macFile) {
        const btn = document.getElementById(
          "btn-mac-dl"
        ) as HTMLAnchorElement;
        if (btn) {
          btn.href = macFile.browser_download_url;
          btn.classList.remove("hidden");
        }
        const verMac = document.getElementById("ver-mac");
        if (verMac) verMac.innerText = "Version " + tag;
      }
    })
    .catch((e) => console.log("API Error", e));
});
