const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browsebtn");
const fileInput = document.querySelector("#fileInput");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const host = "http://localhost:3000/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024;

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }

  dropZone.classList.remove("dragged");
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

copyBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Link copied");
});

const uploadFile = () => {
  if (fileInput.files.length > 1) {
    resetFileInput();
    showToast("Only upload 1 file!");
    return;
  }

  const file = fileInput.files[0];

  if (file.size > maxAllowedSize) {
    showToast("Can't upload more than 100MB");
    resetFileInput();
    return;
  }

  progressContainer.style.display = "block";

  const formData = new FormData();

  formData.append("myfile", file);

  // const options = {
  //   method: "POST",

  //   body: formData,
  // };

  // fetch(uploadURL, options)
  //   .then((data) => {
  //     if (!data.ok) {
  //       throw Error(data.status);
  //     }
  //     return data.json();
  //   })
  //   .then((update) => {
  //     console.log(update);
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.upload.onerror = () => {
    resetFileInput();
    showToast(`Error in upload: ${xhr.statusText}`);
    progressContainer.style.display = "none";
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percent = Math.round((e.loaded / e.total) * 100);
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  progressBar.style.transform = `scaleX(${percent / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
  resetFileInput();
  emailForm[2].removeAttribute("disabled");
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURLInput.value = url;
};

const resetFileInput = () => {
  fileInput.value = "";
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const url = fileURLInput.value;
  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  emailForm[2].setAttribute("disabled", "true");

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
        showToast("Email sent");
      }
    });
});

let toastTimer;
const showToast = (msg) => {
  toast.innerText = msg;
  toast.style.transform = "translate(-50% , 0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50% , 60px)";
  }, 2000);
};
