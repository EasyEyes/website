const pastelColors = ["#FFEB3B", "#81D4FA", "#A5D6A7", "#FFCDD2", "#D1C4E9"];

let selectedFiles = [];
const dropZoneRef = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const selectedFilesContainer = document.getElementById("selected-files");
const outputFilenameInput = document.getElementById("output-filename-input");
const filenameWarning = document.getElementById("filename-warning");
const fileError = document.getElementById("file-error");
const diffBtn = document.getElementById("diff-btn");
const joinBtn = document.getElementById("join-btn");
const mergeStatus = document.getElementById("merge-status");

fileInput.addEventListener("change", onDrop);
diffBtn.addEventListener("click", () => handleMerge(false));
joinBtn.addEventListener("click", () => handleMerge(true));
outputFilenameInput.addEventListener("input", () => {
  adjustInputWidth();
  removeMergeStatus();
});

dropZoneRef.addEventListener("click", () => fileInput.click());

function adjustInputWidth() {
  const tempSpan = document.createElement("span");
  tempSpan.style.visibility = "hidden";
  tempSpan.style.position = "absolute";
  tempSpan.style.whiteSpace = "nowrap";
  tempSpan.textContent = outputFilenameInput.value;
  document.body.appendChild(tempSpan);
  const width = tempSpan.offsetWidth + 20;
  outputFilenameInput.style.width = `${width}px`;
  document.body.removeChild(tempSpan);
}

function onDrop(event) {
  const files = event.target.files;
  const validFiles = [];
  const invalidFiles = [];

  for (let file of files) {
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension === "xlsx" || fileExtension === "csv") {
      validFiles.push({ file, name: file.name });
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

  updateOutputFilename();
  adjustInputWidth();
  removeMergeStatus();
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
    outputFilenameInput.style.display = "unset";
    diffBtn.className = "merge-btn-enabled";
    joinBtn.className = "merge-btn-enabled";
  } else {
    outputFilenameInput.style.display = "none";
    diffBtn.className = "merge-btn-disabled";
    joinBtn.className = "merge-btn-disabled";
  }
  removeMergeStatus();
}

function removeFile(index) {
  selectedFiles = selectedFiles.filter((_, i) => i !== index);
  updateSelectedFilesList();
  updateOutputFilename();
  adjustInputWidth();
}

function updateOutputFilename() {
  if (selectedFiles.length > 0) {
    outputFilenameInput.value = `${selectedFiles[0].name
      .split(".")
      .slice(0, -1)
      .join(".")}-MERGED.xlsx`;
  } else {
    outputFilenameInput.value = "";
  }
}

function isValidFilename(filename) {
  const validExtensions = ["xlsx", "csv"];
  const parts = filename.split(".");
  const extension = parts[parts.length - 1].toLowerCase();
  return validExtensions.includes(extension);
}

function removeMergeStatus() {
  mergeStatus.innerText = "";
}

async function handleMerge(joinBool) {
  const outputFilename = outputFilenameInput.value;

  if (!isValidFilename(outputFilename)) {
    filenameWarning.innerText = "⚠ Illegal filename";
    return;
  }
  filenameWarning.innerText = "";

  const readFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    return XLSX.read(arrayBuffer, { type: "array", cellStyles: true });
  };

  const removeEmptyRows = (data) => {
    return data.filter((row) =>
      row.some((cell) => cell !== null && cell !== undefined && cell !== ""),
    );
  };

  const findBlockRowIndex = (data) => {
    return data.findIndex(
      (row) => row[0] && row[0].toString().toLowerCase() === "block",
    );
  };

  const getMaxColumn = (data) => {
    return data.reduce((max, row) => Math.max(max, row.length), 0);
  };

  let primaryFile = await readFile(selectedFiles[0].file);
  let primarySheet = primaryFile.Sheets[primaryFile.SheetNames[0]];
  let primaryData = XLSX.utils.sheet_to_json(primarySheet, {
    header: 1,
    raw: true,
  });
  primaryData = removeEmptyRows(primaryData);
  let primaryBlockRowIndex = findBlockRowIndex(primaryData);
  const primaryBlockRowFiltered = primaryData[primaryBlockRowIndex]
    .slice(1)
    .map(Number)
    .filter((x) => !isNaN(x));
  let maxBlock = Math.max(...primaryBlockRowFiltered) || 0;
  let maxColumn = getMaxColumn(primaryData);

  const preProcessedFiles = [primaryData];

  if (joinBool) {
    for (let i = 1; i < selectedFiles.length; i++) {
      const secondaryFile = await readFile(selectedFiles[i].file);
      let secondarySheet = secondaryFile.Sheets[secondaryFile.SheetNames[0]];
      let secondaryData = XLSX.utils.sheet_to_json(secondarySheet, {
        header: 1,
        raw: true,
      });
      secondaryData = removeEmptyRows(secondaryData);
      let secondaryBlockRowIndex = findBlockRowIndex(secondaryData);

      if (secondaryBlockRowIndex >= 0) {
        for (
          let col = 1;
          col < secondaryData[secondaryBlockRowIndex].length;
          col++
        ) {
          if (
            secondaryData[secondaryBlockRowIndex][col] !== undefined &&
            secondaryData[secondaryBlockRowIndex][col] !== ""
          ) {
            secondaryData[secondaryBlockRowIndex][col] =
              Number(secondaryData[secondaryBlockRowIndex][col]) + maxBlock;
          }
        }
      }

      // Shift columns starting from the third column (index 2)
      let newSecondaryData = secondaryData.map((row) => {
        let newRow = row.slice(0, 2);
        for (let col = 2; col < row.length; col++) {
          newRow[maxColumn + col - 2] = row[col];
        }
        return newRow;
      });

      const secondaryBlockRowFiltered = secondaryData[secondaryBlockRowIndex]
        .slice(1)
        .map(Number)
        .filter((x) => !isNaN(x));
      maxBlock += Math.max(...secondaryBlockRowFiltered) || 0;
      maxColumn = Math.max(maxColumn, getMaxColumn(newSecondaryData));

      preProcessedFiles.push(newSecondaryData);
    }
  } else {
    for (let i = 1; i < selectedFiles.length; i++) {
      const secondaryFile = await readFile(selectedFiles[i].file);
      let secondarySheet = secondaryFile.Sheets[secondaryFile.SheetNames[0]];
      let secondaryData = XLSX.utils.sheet_to_json(secondarySheet, {
        header: 1,
        raw: true,
      });
      secondaryData = removeEmptyRows(secondaryData);
      preProcessedFiles.push(secondaryData);
    }
  }

  // Merge the pre-processed files
  let mergedData = preProcessedFiles[0];
  let sourceFileNo = Array(mergedData.length).fill(1);
  let consensusBool = Array(mergedData.length).fill(true);

  for (let i = 1; i < preProcessedFiles.length; i++) {
    let secondaryData = preProcessedFiles[i];
    const secondarySourceFileNo = Array(secondaryData.length).fill(i + 1);

    const mergeData = [];
    const mergeSourceFileNo = [];
    const mergeConsensusBool = [];

    let primaryRowNo = 0;
    let secondaryRowNo = 0;

    while (
      primaryRowNo < mergedData.length ||
      secondaryRowNo < secondaryData.length
    ) {
      const getRowKey = (row) => {
        let key = row[0] ? row[0].toString().toLowerCase() : "";
        return key.startsWith("%") ? key.substring(1) : key;
      };

      if (primaryRowNo >= mergedData.length) {
        mergeData.push(secondaryData[secondaryRowNo]);
        mergeSourceFileNo.push(secondarySourceFileNo[secondaryRowNo]);
        mergeConsensusBool.push(false);
        secondaryRowNo++;
      } else if (secondaryRowNo >= secondaryData.length) {
        mergeData.push(mergedData[primaryRowNo]);
        mergeSourceFileNo.push(sourceFileNo[primaryRowNo]);
        mergeConsensusBool.push(false);
        primaryRowNo++;
      } else {
        const primaryRow = mergedData[primaryRowNo];
        const secondaryRow = secondaryData[secondaryRowNo];
        const primaryKey = getRowKey(primaryRow);
        const secondaryKey = getRowKey(secondaryRow);

        if (JSON.stringify(primaryRow) === JSON.stringify(secondaryRow)) {
          mergeData.push(primaryRow);
          mergeSourceFileNo.push(sourceFileNo[primaryRowNo]);
          mergeConsensusBool.push(consensusBool[primaryRowNo] && true);
          primaryRowNo++;
          secondaryRowNo++;
        } else if (primaryKey === secondaryKey) {
          const mergedRowPrimary = [];
          const mergedRowSecondary = [];
          const maxCols = Math.max(primaryRow.length, secondaryRow.length);

          for (let col = 0; col < maxCols; col++) {
            if (primaryRow[col] !== secondaryRow[col]) {
              mergedRowPrimary.push({
                value: primaryRow[col] !== undefined ? primaryRow[col] : "",
                color: pastelColors[
                  (sourceFileNo[primaryRowNo] - 1) % pastelColors.length
                ].replace("#", ""),
              });
              mergedRowSecondary.push({
                value: secondaryRow[col] !== undefined ? secondaryRow[col] : "",
                color: pastelColors[
                  (secondarySourceFileNo[secondaryRowNo] - 1) %
                    pastelColors.length
                ].replace("#", ""),
              });
              mergeConsensusBool.push(false);
            } else {
              mergedRowPrimary.push({ value: primaryRow[col], color: null });
              mergedRowSecondary.push({
                value: secondaryRow[col],
                color: null,
              });
            }
          }
          mergeData.push(mergedRowPrimary);
          mergeData.push(mergedRowSecondary);
          mergeSourceFileNo.push(sourceFileNo[primaryRowNo]);
          mergeSourceFileNo.push(secondarySourceFileNo[secondaryRowNo]);
          primaryRowNo++;
          secondaryRowNo++;
        } else if (primaryKey < secondaryKey) {
          mergeData.push(primaryRow);
          mergeSourceFileNo.push(sourceFileNo[primaryRowNo]);
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

    mergedData = mergeData;
    sourceFileNo = mergeSourceFileNo;
    consensusBool = mergeConsensusBool;
  }

  const header = selectedFiles.map((file, index) => [`% ${file.name}`]);
  const headerColors = selectedFiles.map((file, index) =>
    pastelColors[index % pastelColors.length].replace("#", ""),
  );

  const mergedSheetData = [
    ...header,
    ...mergedData.map((row) =>
      row.map((cell) => (typeof cell === "object" ? cell.value : cell)),
    ),
  ];
  const mergedSheet = XLSX.utils.aoa_to_sheet(mergedSheetData);
  const sheetRange = XLSX.utils.decode_range(mergedSheet["!ref"]);

  for (let rowNo = sheetRange.s.r; rowNo <= sheetRange.e.r; rowNo++) {
    if (rowNo < selectedFiles.length) {
      const color = headerColors[rowNo];
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
    } else {
      const actualRowNo = rowNo - selectedFiles.length;
      const row = mergedData[actualRowNo];
      for (let colNo = sheetRange.s.c; colNo <= sheetRange.e.c; colNo++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowNo, c: colNo });
        const cell = mergedSheet[cellRef];
        if (cell && row[colNo] && row[colNo].color) {
          cell.s = cell.s || {};
          cell.s.fill = {
            patternType: "solid",
            fgColor: { rgb: row[colNo].color },
          };
        }
      }
    }
  }

  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, mergedSheet, "Merged Data");

  XLSX.writeFile(newWorkbook, outputFilename);
  mergeStatus.innerText = "✅";
}
