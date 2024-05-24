const pastelColors = ["#FFEB3B", "#81D4FA", "#A5D6A7", "#FFCDD2", "#D1C4E9"];

let selectedFiles = [];
const dropZoneRef = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const selectedFilesContainer = document.getElementById("selected-files");
const outputFilenameInput = document.getElementById("output-filename-input");
const filenameWarning = document.getElementById("filename-warning");
const fileError = document.getElementById("file-error");
const mergeBtn = document.getElementById("merge-btn");

fileInput.addEventListener("change", onDrop);
mergeBtn.addEventListener("click", handleMerge);

dropZoneRef.addEventListener("click", () => fileInput.click());

function onDrop(event) {
  const files = event.target.files;
  const validFiles = [];
  const invalidFiles = [];

  for (let file of files) {
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension === "xlsx" || fileExtension === "csv") {
      validFiles.push({
        file,
        name: file.name,
      });
    } else {
      invalidFiles.push(file.name);
    }
  }

  if (invalidFiles.length > 0) {
    fileError.innerText = `Invalid file type: ${invalidFiles.join(
      ", ",
    )}. Only XLSX and CSV files are allowed.`;
  } else {
    fileError.innerText = "";
  }

  selectedFiles = [...selectedFiles, ...validFiles];
  updateSelectedFilesList();

  if (!outputFilenameInput.value && selectedFiles.length > 1) {
    outputFilenameInput.value = `${selectedFiles[0].name
      .split(".")
      .slice(0, -1)
      .join(".")}-MERGED.xlsx`;
  }
}

function updateSelectedFilesList() {
  selectedFilesContainer.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const fileDiv = document.createElement("div");
    fileDiv.className = "selected-file";
    fileDiv.innerHTML = `
            <span style="background-color: ${
              pastelColors[index % pastelColors.length]
            }; padding: 5px;">
                ${index + 1}. ${file.name}
            </span>
            <span style="cursor: pointer; padding-left: 10px;" onclick="removeFile(${index})">
                <i class="bi bi-x-circle"></i>
            </span>
        `;
    selectedFilesContainer.appendChild(fileDiv);
  });
  if (selectedFiles.length > 1) {
    document.getElementById("output-filename-input").style.display = "unset";
    mergeBtn.className = "merge-btn-enabled";
  } else {
    document.getElementById("output-filename-input").style.display = "none";
    mergeBtn.className = "merge-btn-disabled";
  }
}

function removeFile(index) {
  selectedFiles = selectedFiles.filter((_, i) => i !== index);
  updateSelectedFilesList();
}

function isValidFilename(filename) {
  const validExtensions = ["xlsx", "csv"];
  const parts = filename.split(".");
  const extension = parts[parts.length - 1].toLowerCase();
  return validExtensions.includes(extension);
}

async function handleMerge() {
  const outputFilename = outputFilenameInput.value;

  if (!isValidFilename(outputFilename)) {
    filenameWarning.innerText = "⚠ Illegal filename";
    return;
  }
  filenameWarning.innerText = "";

  const readFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    return XLSX.read(arrayBuffer, { type: "array" });
  };

  const removeEmptyRows = (data) => {
    return data.filter((row) =>
      row.some((cell) => cell !== null && cell !== undefined && cell !== ""),
    );
  };

  const primaryFile = await readFile(selectedFiles[0].file);
  let primarySheet = primaryFile.Sheets[primaryFile.SheetNames[0]];
  let primaryData = XLSX.utils.sheet_to_json(primarySheet, { header: 1 });
  primaryData = removeEmptyRows(primaryData);

  let primarySourceFileNo = Array(primaryData.length).fill(1);
  let primaryConsensusBool = Array(primaryData.length).fill(true);
  let processedFileCount = 1;

  for (let i = 1; i < selectedFiles.length; i++) {
    const secondaryFile = await readFile(selectedFiles[i].file);
    let secondarySheet = secondaryFile.Sheets[secondaryFile.SheetNames[0]];
    let secondaryData = XLSX.utils.sheet_to_json(secondarySheet, { header: 1 });
    secondaryData = removeEmptyRows(secondaryData);

    const secondarySourceFileNo = Array(secondaryData.length).fill(i + 1);

    const mergeData = [];
    const mergeSourceFileNo = [];
    const mergeConsensusBool = [];

    let primaryRowNo = 0;
    let secondaryRowNo = 0;

    while (
      primaryRowNo < primaryData.length ||
      secondaryRowNo < secondaryData.length
    ) {
      if (primaryRowNo >= primaryData.length) {
        mergeData.push(secondaryData[secondaryRowNo]);
        mergeSourceFileNo.push(secondarySourceFileNo[secondaryRowNo]);
        mergeConsensusBool.push(false);
        secondaryRowNo++;
      } else if (secondaryRowNo >= secondaryData.length) {
        mergeData.push(primaryData[primaryRowNo]);
        mergeSourceFileNo.push(primarySourceFileNo[primaryRowNo]);
        mergeConsensusBool.push(false);
        primaryRowNo++;
      } else {
        const primaryRow = primaryData[primaryRowNo];
        const secondaryRow = secondaryData[secondaryRowNo];

        if (JSON.stringify(primaryRow) === JSON.stringify(secondaryRow)) {
          mergeData.push(primaryRow);
          mergeSourceFileNo.push(primarySourceFileNo[primaryRowNo]);
          mergeConsensusBool.push(primaryConsensusBool[primaryRowNo] && true);
          primaryRowNo++;
          secondaryRowNo++;
        } else if (JSON.stringify(primaryRow) < JSON.stringify(secondaryRow)) {
          mergeData.push(primaryRow);
          mergeSourceFileNo.push(primarySourceFileNo[primaryRowNo]);
          mergeConsensusBool.push(false);
          primaryRowNo++;
        } else {
          mergeData.push(secondaryRow);
          mergeSourceFileNo.push(secondarySourceFileNo[secondaryRowNo]);
          mergeConsensusBool.push(false);
          secondaryRowNo++;
        }
      }
    }

    primaryData = mergeData;
    primarySourceFileNo = mergeSourceFileNo;
    primaryConsensusBool = mergeConsensusBool;
    processedFileCount++;
  }

  const mergedSheet = XLSX.utils.aoa_to_sheet(primaryData);
  const sheetRange = XLSX.utils.decode_range(mergedSheet["!ref"]);

  for (let rowNo = sheetRange.s.r; rowNo <= sheetRange.e.r; rowNo++) {
    if (!primaryConsensusBool[rowNo]) {
      const color = pastelColors[
        (primarySourceFileNo[rowNo] - 1) % pastelColors.length
      ].replace("#", "");
      for (let colNo = sheetRange.s.c; colNo <= sheetRange.e.c; colNo++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowNo, c: colNo });
        const cell = mergedSheet[cellRef];
        if (cell) {
          cell.s = cell.s || {};
          cell.s.fill = {
            patternType: "solid",
            fgColor: { rgb: color },
          };
        }
      }
    }
  }

  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, mergedSheet, "Merged Data");

  XLSX.writeFile(newWorkbook, outputFilename);
}
