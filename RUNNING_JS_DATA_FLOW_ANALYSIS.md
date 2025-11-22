# Running.js File Analysis: Complete Data Flow to Prolific API

## Table of Contents

1. [Running.js Overview](#running-js-overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [User.currentExperiment Object](#usercurrentexperiment-object)
4. [Completion Code Generation](#completion-code-generation)
5. [Complete User Journey](#complete-user-journey)
6. [Detailed Function Analysis](#detailed-function-analysis)
7. [Data Parameters Reference](#data-parameters-reference)
8. [Diagrams](#diagrams)

---

## Running.js Overview

### File Purpose

`/docs/experiment/source/Running.js` is a React component that manages the experiment execution and deployment phase. It serves as the gateway between:

- User UI interactions (buttons, status checks)
- Experiment status monitoring (Pavlovia readiness, data collection)
- Participant recruitment (Prolific integration)
- Result data handling (downloads, exports)

### Key Responsibilities

1. **Experiment Activation**: Set experiment to RUNNING mode on Pavlovia
2. **Status Monitoring**: Check Pavlovia readiness, monitor Prolific submissions
3. **Prolific Study Management**: Create and manage recruitment studies
4. **Data Collection**: Monitor results and provide download functionality

---

## Data Flow Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW CHAIN                     │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: EXPERIMENT DEFINITION (Spreadsheet)
├─ User creates Excel/CSV with experiment parameters
├─ Parameters include: _online*, _prolific*, titles, descriptions
└─ Parameters define study configuration, recruitment, eligibility

         ↓↓↓ User uploads file ↓↓↓

PHASE 2: TABLE COMPONENT (File Processing)
├─ Table.js receives file via onDrop()
├─ handleTable() calls preprocessExperimentFile()
├─ preprocessExperimentFile extracts all parameters
├─ Creates user.currentExperiment object with all parameters
├─ Stores user object in App state
└─ Stores reference in localStorage if new experiment

         ↓↓↓ User navigates to Running step ↓↓↓

PHASE 3: RUNNING COMPONENT (Current File)
├─ componentDidMount() receives user prop with filled currentExperiment
├─ User can create Prolific study by clicking button
├─ generateAndUploadCompletionURL() generates 3 completion codes
├─ Completion codes saved to GitLab repository
└─ Codes passed to prolificCreateDraft()

         ↓↓↓ User clicks "Create Prolific Study" ↓↓↓

PHASE 4: PROLIFIC INTEGRATION (API Call)
├─ prolificCreateDraft() receives:
│  ├─ user (with currentExperiment)
│  ├─ projectName
│  ├─ completionCode (main)
│  ├─ incompatibleCompletionCode
│  ├─ abortedCompletionCode
│  └─ prolificToken (user's API token)
├─ Function builds comprehensive payload
├─ Payload includes all eligibility requirements from currentExperiment
├─ POST request sent to Netlify proxy function
└─ Prolific study draft created on Prolific platform

         ↓↓↓ Response returned to client ↓↓↓

PHASE 5: COMPLETION
├─ Study draft available in Prolific interface
├─ Researcher can publish study to recruit participants
└─ Participants complete experiment and return results
```

---

## User.currentExperiment Object

### Object Creation

**File**: `/docs/experiment/source/App.js` (Lines 350-358)

```javascript
refreshedUser.currentExperiment = {
  participantRecruitmentServiceName: "",
  participantRecruitmentServiceUrl: "",
  participantRecruitmentServiceCode: "",
  experimentUrl: "",
  pavloviaOfferPilotingOptionBool: false,
  pavloviaPreferRunningModeBool: true,
};
```

### Object Population

**File**: `/docs/experiment/source/App.js` (Lines 498-507)

```javascript
handleSetExperiment(experiment) {
  this.setState({
    user: {
      ...this.state.user,
      currentExperiment: {
        ...this.state.user.currentExperiment,
        ...experiment,  // Merges new properties with existing ones
      },
    },
  });
}
```

The `handleSetExperiment()` function is called from `preprocessExperimentFile()` with an object containing all extracted parameters from the uploaded spreadsheet.

### Object Structure

The `user.currentExperiment` object is hierarchical:

```javascript
user.currentExperiment = {
  // Basic Experiment Info
  titleOfStudy: "My Study",
  descriptionOfStudy: "Study description",
  experimentUrl: "https://pavlovia.org/user/project",

  // Recruitment Service Info
  participantRecruitmentServiceName: "Prolific",
  participantRecruitmentServiceUrl: "...",
  participantRecruitmentServiceCode: "...",
  prolificWorkspaceProjectId: "proj_123",

  // Pavlovia Settings
  pavloviaPreferRunningModeBool: true,
  pavloviaOfferPilotingOptionBool: false,

  // Participant Requirements
  _participantsHowMany: 50,
  _participantDurationMinutes: 30,

  // Payment Info (_online2 = payment parameters)
  _online2Pay: 5.0,
  _online2PayPerHour: 10.0,
  _online2Description: "Full study description for Prolific",

  // Device Requirements (_online3 = device parameters)
  _online3DeviceKind: "Desktop, Mobile",
  _online3PhoneOperatingSystem: "iOS, Android",
  _online3RequiredServices: "Microphone, Speaker, Camera",

  // Location & Demographics (_online4 = location/demographics)
  _online4Location: "USA, UK, Canada",
  _online4CustomAllowList: "prolific_id_1, prolific_id_2",
  _online4CustomBlockList: "prolific_id_3",

  // Language Requirements (_online5 = language/ability parameters)
  _online5LanguageFirst: "English",
  _online5LanguageFluent: "English, Spanish",
  _online5LanguagePrimary: "English",
  _online5Vision: "Normal vision, Corrected to normal",
  _online5Dyslexia: "No diagnosis",
  _online5HearingDifficulties: "None",
  _online5MusicalInstrumentExperience: "5+ years",
  _online5LanguageRelatedDisorders: "None",
  _online5CochlearImplant: "No",
  _online5VRExperiences: "None",
  _online5VRHeadset: "No",
  _online5VRHeadsetUsage: "Never",
  _online5VisionCorrection: "No correction needed",

  // Prolific Settings (_prolific = Prolific-specific configuration)
  _prolific2CompletionPath: "manuallyReview" | "approveAndPay",
  _prolific2Aborted: "requestAReturn" | "approveAndPay" | "manuallyReview",
  _prolific2CompletionPathAddToGroup: "group_id",
  _prolific2AbortedAddToGroup: "group_id",

  // Internal Names
  _online1Title: "Default study title",
  _online1InternalName: "study_internal_id",
};
```

### Parameter Naming Convention

| Prefix      | Meaning                     | Example                          | Used For              |
| ----------- | --------------------------- | -------------------------------- | --------------------- |
| `_online1`  | Title/basic info            | `_online1Title`                  | Study name            |
| `_online2`  | Payment parameters          | `_online2Pay`                    | Reward amount         |
| `_online3`  | Device/service requirements | `_online3DeviceKind`             | Device compatibility  |
| `_online4`  | Location/demographics       | `_online4Location`               | Geographic filters    |
| `_online5`  | Language/ability parameters | `_online5Vision`                 | Eligibility criteria  |
| `_prolific` | Prolific-specific settings  | `_prolific2CompletionPath`       | Completion behavior   |
| Other       | Recruitment service generic | `participantRecruitmentService*` | Service configuration |

---

## Completion Code Generation

### Overview

Completion codes are unique identifiers that Prolific uses to track participant submissions. Three types are generated:

1. **Main Completion Code**: Returned when participant completes study successfully
2. **Incompatible Device Code**: Returned when participant's device is incompatible
3. **Aborted Code**: Returned when participant abandons study

### Generation Process

**File**: `/docs/experiment/threshold/preprocess/gitlabUtils.ts` (Lines 2606-2695)

Function: `generateAndUploadCompletionURL(user, experiment, handleUpdateUser)`

#### Step 1: Generate Three Codes

```javascript
// Main completion code: 3 digits (100-999)
const code = String(100 + Math.floor(Math.random() * 900));

// Incompatible device code: 7-character alphanumeric
const incompatibleCompletionCode = generateRandomString(7);

// Aborted submission code: 6-character alphanumeric
const abortedCompletionCode = generateRandomString(6);
```

#### Step 2: Save to Repository

The codes are saved to GitLab repository as `recruitmentServiceConfig.csv`:

```csv
recruitmentServiceName,recruitmentServiceUrl,completionCode,incompatibleCompletionCode,abortedCompletionCode
Prolific,https://app.prolific.com/researcher/workspaces/studies/abc123,456,XYZ1234,ABC123
```

#### Step 3: Return to Caller

```javascript
return {
  code: completionCode,
  incompatibleCompletionCode: incompatibleCompletionCode,
  abortedCompletionCode: abortedCompletionCode,
};
```

### Flow in Running.js

**File**: `/docs/experiment/source/Running.js` (Lines 466-533)

```javascript
// USER CLICKS "Create Prolific study" button (line 465)

// Step 1: Check if completion codes already exist
const hasCompletionCode = !!completionCode;

// Step 2: Generate codes if needed
const { code, incompatibleCompletionCode, abortedCompletionCode } =
  completionCode ??
  (await generateAndUploadCompletionURL(
    user,
    activeExperiment,
    functions.handleUpdateUser, // Callback to update user state
  ));

// Step 3: Store codes in component state (if newly generated)
if (!hasCompletionCode) {
  this.setState({
    completionCode: code, // Store to avoid regenerating
  });
}

// Step 4: Create Prolific study with codes
const result = await prolificCreateDraft(
  user, // Contains currentExperiment
  projectName, // Project name from props
  code, // Main completion code
  incompatibleCompletionCode, // Device incompatibility code
  abortedCompletionCode, // Aborted submission code
  prolificToken, // User's Prolific API token
);
```

---

## Complete User Journey

### Journey Map: From Spreadsheet to Prolific Study

```
START: User Has Experiment Spreadsheet
│
├─ Spreadsheet contains:
│  ├─ Experiment configuration (titleOfStudy, descriptionOfStudy)
│  ├─ _online* parameters (payment, device, location, eligibility)
│  ├─ _prolific* parameters (completion behavior, groups)
│  └─ Resource files (images, sounds, code)
│
├─ [UPLOAD PHASE] User drops spreadsheet in Table.js
│  │
│  ├─ onDrop() triggered (Table.js:38-48)
│  ├─ handleDrop() processes file
│  ├─ handleTable() called (Table.js:50-200)
│  ├─ preprocessExperimentFile() extracts parameters (Table.js:107)
│  │  ├─ Parses spreadsheet rows
│  │  ├─ Extracts all parameter values
│  │  ├─ Validates against glossary definitions
│  │  └─ Creates experiment object
│  │
│  ├─ handleSetExperiment() called via callback
│  │  ├─ Creates/updates user.currentExperiment
│  │  └─ Stores in App state (App.js:498-507)
│  │
│  └─ User navigates to "Running" step
│
├─ [RUNNING PHASE] User interacts with experiment in Running.js
│  │
│  ├─ componentDidMount() (Running.js:43-63)
│  │  ├─ Loads data folder length
│  │  ├─ Fetches compile counts from Firebase
│  │  ├─ Calls setModeToRun() to activate experiment
│  │  └─ Experiment now in RUNNING mode on Pavlovia
│  │
│  ├─ [OPTIONAL] User clicks "Create Prolific study" button (Running.js:465)
│  │  │
│  │  ├─ Step 1: Check for existing study (Running.js:471-486)
│  │  │  ├─ getProlificStudyId() queries for existing study
│  │  │  └─ If exists, open in Prolific and return
│  │  │
│  │  ├─ Step 2: Generate completion codes (Running.js:497-505)
│  │  │  ├─ generateAndUploadCompletionURL() called
│  │  │  ├─ Three codes created:
│  │  │  │  ├─ Main completion code
│  │  │  │  ├─ Incompatible device code
│  │  │  │  └─ Aborted submission code
│  │  │  └─ Codes saved to GitLab repository
│  │  │
│  │  ├─ Step 3: Build Prolific payload (prolificIntegration.js:672-820)
│  │  │  │
│  │  │  ├─ Extract user.currentExperiment properties
│  │  │  │
│  │  │  ├─ Basic Study Info:
│  │  │  │  ├─ name: titleOfStudy or _online1Title
│  │  │  │  ├─ description: descriptionOfStudy or _online2Description
│  │  │  │  ├─ internal_name: _online1InternalName
│  │  │  │  └─ external_study_url: experimentUrl
│  │  │  │
│  │  │  ├─ Participant Requirements:
│  │  │  │  ├─ total_available_places: _participantsHowMany
│  │  │  │  ├─ estimated_completion_time: _participantDurationMinutes
│  │  │  │  ├─ device_compatibility: parse _online3DeviceKind
│  │  │  │  └─ peripheral_requirements: parse _online3RequiredServices
│  │  │  │
│  │  │  ├─ Payment Calculation:
│  │  │  │  ├─ hours = _participantDurationMinutes / 60
│  │  │  │  ├─ reward = (_online2Pay + _online2PayPerHour * hours) * 100 (in pence)
│  │  │  │  └─ reward sent to Prolific
│  │  │  │
│  │  │  ├─ Eligibility Requirements:
│  │  │  │  ├─ Language (first, fluent, primary)
│  │  │  │  ├─ Location (_online4Location)
│  │  │  │  ├─ Device OS (_online3PhoneOperatingSystem)
│  │  │  │  ├─ Vision (_online5Vision)
│  │  │  │  ├─ Hearing (_online5HearingDifficulties)
│  │  │  │  ├─ Dyslexia (_online5Dyslexia)
│  │  │  │  ├─ Music experience (_online5MusicalInstrumentExperience)
│  │  │  │  ├─ Language disorders (_online5LanguageRelatedDisorders)
│  │  │  │  ├─ Cochlear implant (_online5CochlearImplant)
│  │  │  │  ├─ VR experience (_online5VRExperiences)
│  │  │  │  ├─ VR headset ownership (_online5VRHeadset)
│  │  │  │  ├─ VR frequency (_online5VRHeadsetUsage)
│  │  │  │  └─ Vision correction (_online5VisionCorrection)
│  │  │  │
│  │  │  ├─ Completion Codes:
│  │  │  │  ├─ code: Main completion code
│  │  │  │  ├─ code_type: COMPLETED
│  │  │  │  ├─ actions: Auto-approve or manual review (from _prolific2CompletionPath)
│  │  │  │  │
│  │  │  │  ├─ incompatibleCompletionCode: Device incompatibility
│  │  │  │  ├─ code_type: INCOMPATIBLE_DEVICE
│  │  │  │  └─ actions: Request return
│  │  │  │
│  │  │  │  ├─ abortedCompletionCode: Aborted submission
│  │  │  │  ├─ code_type: ABORTED
│  │  │  │  └─ actions: From _prolific2Aborted (auto-approve, manual review, request return)
│  │  │  │
│  │  │  ├─ Participant Groups:
│  │  │  │  ├─ _prolific2CompletionPathAddToGroup: For completed submissions
│  │  │  │  └─ _prolific2AbortedAddToGroup: For aborted submissions
│  │  │  │
│  │  │  ├─ Allow/Block Lists:
│  │  │  │  ├─ _online4CustomAllowList: Only these Prolific IDs allowed
│  │  │  │  └─ _online4CustomBlockList: These Prolific IDs blocked
│  │  │  │
│  │  │  └─ Location Selection:
│  │  │     └─ _online4Location: Geographic region(s)
│  │  │
│  │  ├─ Step 4: Send to Prolific (prolificIntegration.js:822-829)
│  │  │  │
│  │  │  ├─ POST to /.netlify/functions/prolific/studies/
│  │  │  ├─ Headers:
│  │  │  │  ├─ Content-Type: application/json
│  │  │  │  ├─ authorization: Token {prolificToken}
│  │  │  │  └─ Additional headers from request
│  │  │  │
│  │  │  ├─ Body: Complete payload (JSON)
│  │  │  │
│  │  │  ├─ Netlify function (/netlify/functions/prolific/index.js):
│  │  │  │  ├─ Validates request
│  │  │  │  ├─ Extracts task type: "studies/"
│  │  │  │  ├─ Forwards to Prolific API:
│  │  │  │  │  └─ POST https://api.prolific.com/api/v1/studies/
│  │  │  │  ├─ Returns JSON response
│  │  │  │  └─ CORS headers applied
│  │  │  │
│  │  │  └─ Response received
│  │  │
│  │  └─ Step 5: Handle response (Running.js:517-530)
│  │     ├─ Check response.status === "UNPUBLISHED"
│  │     ├─ Open study in Prolific browser window
│  │     ├─ Save study ID to GitLab file
│  │     └─ Display success to user
│  │
│  ├─ [MONITORING] User can check study progress
│  │  │
│  │  ├─ Click "Refresh" button (Running.js:650-675)
│  │  │  ├─ Calls getDataFolderCsvLength() - counts result files
│  │  │  ├─ Calls getProlificStudyStatus() - checks submissions
│  │  │  ├─ Calls getExperimentStatus() - checks Pavlovia status
│  │  │  └─ Updates UI with current progress
│  │  │
│  │  └─ Click "Go to Prolific" (Running.js:546-557)
│  │     ├─ getProlificStudyId() retrieves study ID
│  │     └─ Opens Prolific interface in browser
│  │
│  └─ [DOWNLOAD] Download results (Running.js:578-595)
│     ├─ Click "Download results" button
│     ├─ downloadDataFolder() called
│     │  ├─ Fetches data from Pavlovia
│     │  ├─ downloadDemographicData() gets Prolific demographics
│     │  │  ├─ GET /.netlify/functions/prolific/studies/{id}/export/
│     │  │  ├─ Server calls: GET https://api.prolific.com/api/v1/studies/{id}/export/
│     │  │  └─ Returns CSV with participant demographics
│     │  └─ Combines into ZIP file
│     └─ ZIP downloaded to user's computer
│
└─ END: Researcher can now analyze results
```

---

## Detailed Function Analysis

### 1. Running.js: componentDidMount()

**File**: `/docs/experiment/source/Running.js` (Lines 43-63)

```javascript
async componentDidMount() {
  // Scroll to this step in the UI
  this.props.scrollToCurrentStep();

  // Get count of CSV result files
  const [dataFolderLength, latestDateForDataCollection] =
    await getDataFolderCsvLength(
      this.props.user,
      this.props.activeExperiment,
    );

  // Store file count in component state
  this.setState({ dataFolderLength, latestDateForDataCollection });

  // Get compile counts from Firebase
  get(ref(db, "compileCounts/")).then((snapshot) => {
    const compileCounts = snapshot.val();
    // Sum all compile counts and add 1
    const totalCompileCounts =
      Object.values(compileCounts).reduce((a, b) => a + b, 0) + 1;
    // Update app state with new total
    this.props.functions.handleSetCompileCount(totalCompileCounts);
  });

  // Activate experiment (set to RUNNING mode)
  await this.setModeToRun();
}
```

**Purpose**: Initialize the Running step, activate experiment, and load initial data

**Data Flow**:

1. Receives `user` prop with `currentExperiment` already filled
2. Queries file system for existing results (via `getDataFolderCsvLength`)
3. Fetches compile statistics from Firebase
4. Calls `setModeToRun()` to activate Pavlovia experiment

---

### 2. Running.js: setModeToRun()

**File**: `/docs/experiment/source/Running.js` (Lines 89-123)

```javascript
async setModeToRun(e = null) {
  // Prevent multiple simultaneous activations
  if (this._isActivating) {
    return;
  }
  this._isActivating = true;

  try {
    // Show loading dialog
    await Swal.fire({
      title: "Activating ...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading(null);

        // Get fresh project list from GitLab
        getAllProjects(this.props.user).then((updatedProjects) => {
          this.props.functions.handleSetProjectList(updatedProjects);
        });

        // Run the experiment activation
        const result = await runExperiment(
          this.props.user,              // User with currentExperiment
          this.props.activeExperiment,  // Selected experiment
          this.props.user.currentExperiment.experimentUrl,  // Pavlovia URL
        );

        // Check if activation succeeded
        if (result && result.newStatus === "RUNNING") {
          // Wait for Pavlovia to be ready
          await this.waitForPavloviaReady();
          if (e !== null) e.target.removeAttribute("disabled");
        }

        Swal.close();
      },
    });
  } catch (error) {
    console.error("Failed to setModeToRun", error);
  } finally {
    this._isActivating = false;
  }
}
```

**Purpose**: Activate experiment in Pavlovia (transition from INACTIVE to RUNNING)

**Data Flow**:

1. Calls `runExperiment()` with `user.currentExperiment.experimentUrl`
2. Waits for Pavlovia to confirm readiness
3. Updates app state to reflect new status

---

### 3. Running.js: Create Prolific Study (Button Handler)

**File**: `/docs/experiment/source/Running.js` (Lines 464-533)

```javascript
// Button click handler
onClick={async (e) => {
  e.target.classList.add("button-disabled");
  e.target.classList.add("button-wait");

  // STEP 1: Check for existing study
  const existingStudyId = await getProlificStudyId(
    user,
    activeExperiment?.id,
  );

  if (existingStudyId) {
    // Study already created, just open it
    window.open(
      "https://app.prolific.com/researcher/workspaces/studies/" +
        existingStudyId,
      "_blank",
    )?.focus();
    e.target.classList.remove("button-disabled");
    e.target.classList.remove("button-wait");
    return;
  }

  // STEP 2: Generate completion codes
  const hasCompletionCode = !!completionCode;
  const {
    code,
    incompatibleCompletionCode,
    abortedCompletionCode,
  } = completionCode ?? (await generateAndUploadCompletionURL(
    user,
    activeExperiment,
    functions.handleUpdateUser,
  ));

  // Store in state to avoid regenerating
  if (!hasCompletionCode)
    this.setState({
      completionCode: code,
    });

  // STEP 3: Create draft study on Prolific
  const result = await prolificCreateDraft(
    user,                           // Contains currentExperiment
    `${this.props.projectName}`,   // Project name for internal_name
    code,                           // Main completion code
    incompatibleCompletionCode,     // Device incompatibility code
    abortedCompletionCode,          // Aborted submission code
    prolificToken,                  // Prolific API token
  );

  // STEP 4: Handle response
  if (result.status === "UNPUBLISHED") {
    // Study created successfully, open in Prolific
    window.open(
      "https://app.prolific.com/researcher/workspaces/studies/" +
        result.id,
      "_blank",
    )?.focus();

    // Save study ID to repository
    await createProlificStudyIdFile(
      activeExperiment,
      user,
      result.id,
    );
  }

  e.target.classList.remove("button-disabled");
  e.target.classList.remove("button-wait");
}}
```

**Key Points**:

- `prolificToken` is passed from props (user's Prolific API token)
- `user` object contains fully populated `currentExperiment`
- Three completion codes are generated once and cached in state
- Study ID saved for future reference

---

### 4. prolificIntegration.js: prolificCreateDraft()

**File**: `/docs/experiment/source/components/prolificIntegration.js` (Lines 672-842)

```javascript
export const prolificCreateDraft = async (
  user, // User object with currentExperiment
  internalName, // Project name from Running.js
  completionCode, // Main code (3 digits)
  incompatibleCompletionCode, // Device code (7 chars)
  abortedCompletionCode, // Aborted code (6 chars)
  token, // Prolific API token
) => {
  const prolificStudyDraftApiUrl = "/.netlify/functions/prolific/studies/";

  // STEP 1: Calculate payment
  const hours =
    parseFloat(user.currentExperiment._participantDurationMinutes / 60) || 0;
  const pay = parseFloat(user.currentExperiment?._online2Pay) || 0;
  const payPerHour =
    parseFloat(user.currentExperiment?._online2PayPerHour) || 0;
  // Convert to pence (multiply by 100)
  const reward = parseInt(
    parseFloat((pay + payPerHour * hours).toFixed(2) * 100),
  );

  // STEP 2: Determine completion action (auto-approve or manual review)
  let completionCodeAction = COMPLETION_CODE_ACTION.AUTOMATICALLY_APPROVE;
  if (
    user.currentExperiment &&
    user.currentExperiment._prolific2CompletionPath === "manuallyReview"
  ) {
    completionCodeAction = COMPLETION_CODE_ACTION.MANUALLY_REVIEW;
  }

  // STEP 3: Determine aborted submission action
  let abortedCodeAction;
  const abortedPath = user.currentExperiment._prolific2Aborted;
  if (abortedPath === "requestAReturn") {
    abortedCodeAction = COMPLETION_CODE_ACTION.REQUEST_RETURN;
  } else if (abortedPath === "approveAndPay") {
    abortedCodeAction = COMPLETION_CODE_ACTION.AUTOMATICALLY_APPROVE;
  } else {
    abortedCodeAction = COMPLETION_CODE_ACTION.MANUALLY_REVIEW;
  }

  // STEP 4: Parse participant allow/block lists
  const allowList = user.currentExperiment._online4CustomAllowList;
  const whiteListParticipants = allowList
    ? allowList.split(",").map((item) => item.trim())
    : [];

  const blockList = user.currentExperiment._online4CustomBlockList;
  const blockListParticipants = blockList
    ? blockList.split(",").map((item) => item.trim())
    : [];

  // STEP 5: Build completion actions
  const completedActions = [
    {
      action: completionCodeAction,
    },
  ];

  // Add to participant group if specified
  if (participantGroup && participantGroup !== "") {
    completedActions.push({
      action: COMPLETION_CODE_ACTION.ADD_TO_PARTICIPANT_GROUP,
      participant_group_id: participantGroup,
    });
  }

  // STEP 6: Build payload
  const payload = {
    // Basic Info (from currentExperiment)
    name:
      user.currentExperiment.titleOfStudy || GLOSSARY["_online1Title"].default,
    internal_name: internalName,
    description:
      user.currentExperiment.descriptionOfStudy ||
      GLOSSARY["_online2Description"].default,
    external_study_url: user.currentExperiment.experimentUrl,

    // Prolific Settings
    prolific_id_option: "url_parameters",
    completion_option: "url",
    project: user.currentExperiment.prolificWorkspaceProjectId ?? undefined,

    // Participant Settings
    total_available_places:
      parseInt(user.currentExperiment._participantsHowMany) || 1,
    estimated_completion_time:
      parseInt(user.currentExperiment._participantDurationMinutes) || 1,
    reward: reward ?? 0, // In pence

    // Device Requirements
    device_compatibility:
      user.currentExperiment._online3DeviceKind
        ?.split(",")
        .map((el) => el.trim())
        .filter((element) => element != "") ?? [],
    peripheral_requirements:
      user.currentExperiment._online3RequiredServices
        ?.split(",")
        .map((element) => element.trim())
        .filter((element) => element != "") ?? [],

    // Completion Codes
    completion_codes: [
      {
        code: completionCode,
        code_type: COMPLETION_CODE_TYPE.COMPLETED,
        actions: completedActions,
      },
      {
        code: incompatibleCompletionCode,
        code_type: COMPLETION_CODE_TYPE.INCOMPATIBLE_DEVICE,
        actions: [
          {
            action: COMPLETION_CODE_ACTION.REQUEST_RETURN,
            return_reason: "Incompatible device",
          },
        ],
      },
      {
        code: abortedCompletionCode,
        code_type: COMPLETION_CODE_TYPE.ABORTED,
        actions: abortedActions,
      },
    ],

    // Eligibility Requirements (built via buildEligibilityRequirements)
    eligibility_requirements: buildEligibilityRequirements(
      whiteListParticipants,
      user,
      blockListParticipants,
    ),

    // Location
    selected_location: findProlificLocationAttributes(
      user.currentExperiment._online4Location,
    ),
  };

  // STEP 7: Send to Prolific API
  const response = await fetch(prolificStudyDraftApiUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${token}`,
    },
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => console.log(error));

  const result = response;

  if (result?.status !== "UNPUBLISHED") {
    console.error(result);
  }

  return result;
};
```

**Key Parameters Extracted from user.currentExperiment**:

| Property                      | Type   | Prolific Field              | Example                        |
| ----------------------------- | ------ | --------------------------- | ------------------------------ |
| `titleOfStudy`                | string | `name`                      | "Reading Study"                |
| `descriptionOfStudy`          | string | `description`               | "Participants read text..."    |
| `experimentUrl`               | string | `external_study_url`        | "https://pavlovia.org/..."     |
| `_participantsHowMany`        | number | `total_available_places`    | 50                             |
| `_participantDurationMinutes` | number | `estimated_completion_time` | 30                             |
| `_online2Pay`                 | number | Reward calculation          | 5.00                           |
| `_online2PayPerHour`          | number | Reward calculation          | 10.00                          |
| `_online3DeviceKind`          | string | `device_compatibility`      | "Desktop, Mobile"              |
| `_online3RequiredServices`    | string | `peripheral_requirements`   | "Microphone, Speaker"          |
| `_online4Location`            | string | `selected_location`         | "USA, UK"                      |
| `_online4CustomAllowList`     | string | Whitelist                   | "prolific_id_1, prolific_id_2" |
| `_online4CustomBlockList`     | string | Blacklist                   | "prolific_id_3"                |
| `_online5*`                   | string | Eligibility requirements    | Language, vision, etc.         |
| `_prolific2CompletionPath`    | string | Completion action           | "approveAndPay"                |
| `_prolific2Aborted`           | string | Aborted action              | "requestAReturn"               |
| `prolificWorkspaceProjectId`  | string | `project`                   | "proj_123"                     |

---

## Data Parameters Reference

### Parameter Categories

#### Category 1: Study Information (\_online1)

```javascript
titleOfStudy: String; // Study title shown to participants
_online1Title: String; // Default title from template
_online1InternalName: String; // Internal Prolific name
descriptionOfStudy: String; // Detailed study description
_online2Description: String; // Default description
```

#### Category 2: Payment (\_online2)

```javascript
_online2Pay: Number; // Base payment in £ (pounds)
_online2PayPerHour: Number; // Hourly rate in £/hour
```

**Calculation**:

```javascript
hours = _participantDurationMinutes / 60;
totalPay = _online2Pay + _online2PayPerHour * hours;
rewardInPence = totalPay * 100; // Prolific requires pence
```

#### Category 3: Device & Services (\_online3)

```javascript
_online3DeviceKind: String; // CSV: "Desktop, Mobile, Tablet"
_online3PhoneOperatingSystem: String; // CSV: "iOS, Android"
_online3RequiredServices: String; // CSV: "Microphone, Speaker, Camera, Download"
```

#### Category 4: Location & Demographics (\_online4)

```javascript
_online4Location: String; // CSV: "USA, UK, Canada, ..."
_online4CustomAllowList: String; // CSV: "prolific_id_1, prolific_id_2, ..."
_online4CustomBlockList: String; // CSV: "prolific_id_3, ..."
```

#### Category 5: Language & Abilities (\_online5)

```javascript
_online5LanguageFirst: String; // First/native language
_online5LanguageFluent: String; // Fluent languages (CSV)
_online5LanguagePrimary: String; // Primary spoken language
_online5Vision: String; // Normal or corrected vision
_online5Dyslexia: String; // Dyslexia diagnosis
_online5HearingDifficulties: String; // Hearing problems
_online5MusicalInstrumentExperience: String; // Years of music training
_online5LanguageRelatedDisorders: String; // Language disorders
_online5CochlearImplant: String; // Cochlear implant status
_online5VRExperiences: String; // VR experience (CSV)
_online5VRHeadset: String; // VR headset ownership
_online5VRHeadsetUsage: String; // VR usage frequency
_online5VisionCorrection: String; // Vision correction method
```

#### Category 6: Prolific Settings (\_prolific)

```javascript
_prolific2CompletionPath: "approveAndPay" | "manuallyReview";
// How to handle completed submissions

_prolific2Aborted: "requestAReturn" | "approveAndPay" | "manuallyReview";
// How to handle aborted submissions

_prolific2CompletionPathAddToGroup: String; // Participant group ID
// Add successful completers to this group

_prolific2AbortedAddToGroup: String; // Participant group ID
// Add aborted participants to this group
```

#### Category 7: Participant Requirements

```javascript
_participantsHowMany: Number; // Target number of participants
_participantDurationMinutes: Number; // Estimated study duration
prolificWorkspaceProjectId: String; // Prolific workspace project ID
```

---

## Diagrams

### Diagram 1: Component Hierarchy & Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                        App.js (Root)                            │
│  State:                                                         │
│  - user { currentExperiment: {...} }                           │
│  - activeExperiment                                            │
│  - projectName                                                 │
│  - prolificToken                                               │
└────────────────────────────────────────────────────────────────┘
              │
              ├─────────────────────────┬──────────────────────┐
              ▼                         ▼                      ▼
      ┌──────────────┐        ┌──────────────┐      ┌──────────────┐
      │   Step.js    │        │  Step.js     │      │  Step.js     │
      │ (login)      │        │  (table)     │      │  (running)   │
      └──────────────┘        └──────────────┘      └──────────────┘
                                   │                      │
                                   ▼                      ▼
                              ┌──────────┐           ┌──────────────┐
                              │ Table.js │           │ Running.js   │
                              └──────────┘           └──────────────┘
                                   │                      │
                                   ▼                      ▼
                  ┌─────────────────────────────┐   ┌─────────────────┐
                  │ preprocessExperimentFile()  │   │ prolificInteg..│
                  │ Fills currentExperiment     │   │ .prolificCreate│
                  │                             │   │ Draft()         │
                  └─────────────────────────────┘   └─────────────────┘
                              │                              │
                              ▼                              ▼
                      ┌──────────────────┐         ┌──────────────────┐
                      │ App.setState()   │         │ /.netlify/       │
                      │ Updates user     │         │ functions/prolific│
                      └──────────────────┘         └──────────────────┘
                              │                              │
                              │                              ▼
                              │                     ┌──────────────────┐
                              │                     │ Prolific API     │
                              │                     │ Creates study    │
                              │                     └──────────────────┘
                              │
                              └──────────► All props flow down
                                          and callbacks flow up
```

### Diagram 2: Data Flow from Spreadsheet to Prolific API

```
┌─────────────────────────────────────────────────────────────────┐
│ SPREADSHEET/CSV FILE                                            │
├─────────────────────────────────────────────────────────────────┤
│ titleOfStudy | _participantsHowMany | _online2Pay | _online4... │
│ "My Study"  | 50                   | 5.00        | "USA, UK"    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User drops file
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Table.js → handleTable() → handleDrop()                         │
├─────────────────────────────────────────────────────────────────┤
│ Processes file, calls preprocessExperimentFile()                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ preprocessExperimentFile()                                      │
├─────────────────────────────────────────────────────────────────┤
│ Extracts all _online and _prolific parameters                  │
│ Creates experiment object with all properties                   │
│ Calls handleSetExperiment(experiment)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ App.js → handleSetExperiment()                                  │
├─────────────────────────────────────────────────────────────────┤
│ user.currentExperiment = { ...previous, ...new }                │
│ setState({ user })                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User navigates to Running step
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Running.js                                                      │
├─────────────────────────────────────────────────────────────────┤
│ Receives user prop with filled currentExperiment                │
│ User clicks "Create Prolific Study"                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ generateAndUploadCompletionURL()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Completion Code Generation                                      │
├─────────────────────────────────────────────────────────────────┤
│ code = "456" (main)                                              │
│ incompatibleCompletionCode = "XYZ1234" (device)                 │
│ abortedCompletionCode = "ABC123" (aborted)                      │
│ All saved to GitLab                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ prolificCreateDraft()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Build Prolific Payload                                          │
├─────────────────────────────────────────────────────────────────┤
│ Extract from currentExperiment:                                  │
│  - name: titleOfStudy                                            │
│  - description: descriptionOfStudy                               │
│  - reward: calculate from _online2Pay + _online2PayPerHour       │
│  - device_compatibility: parse _online3DeviceKind               │
│  - peripheral_requirements: parse _online3RequiredServices      │
│  - eligibility_requirements: build from _online5*               │
│  - completion_codes: [main, incompatible, aborted]              │
│  - selected_location: parse _online4Location                    │
│  - and 20+ more fields                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ /.netlify/functions/prolific/ (Proxy)                           │
├─────────────────────────────────────────────────────────────────┤
│ Receives POST request                                            │
│ Forwards to https://api.prolific.com/api/v1/studies/            │
│ Returns response with study ID                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PROLIFIC PLATFORM                                               │
├─────────────────────────────────────────────────────────────────┤
│ Study Draft Created with ID: "xyz789"                            │
│ Status: UNPUBLISHED                                              │
│ Ready for researcher to review and publish                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Response to client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Running.js → Handle Response                                    │
├─────────────────────────────────────────────────────────────────┤
│ if (result.status === "UNPUBLISHED") {                           │
│   Save study ID to GitLab                                        │
│   Open in Prolific interface                                     │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Diagram 3: State Management & Data Propagation

```
APP STATE (App.js)
├─ user
│  ├─ username, id, email, etc.
│  ├─ accessToken
│  ├─ projectList
│  └─ currentExperiment ◄─────────────┐
│     ├─ titleOfStudy                  │
│     ├─ descriptionOfStudy            │
│     ├─ experimentUrl                 │
│     ├─ _online1Title                 │ Filled by
│     ├─ _online2Pay                   │ preprocessExperimentFile()
│     ├─ _online3DeviceKind            │
│     ├─ _online4Location              │
│     ├─ _online5Vision                │
│     ├─ _prolific2CompletionPath      │
│     └─ ... (30+ parameters total)    │
│
├─ prolificToken (User's Prolific API key)
│
├─ activeExperiment (Selected experiment object)
│
├─ projectName (Project name from activeExperiment)
│
└─ functions { handleSetExperiment, ... }


PROPS FLOW (from App.js to Running.js)
┌─────────────────────────────────────────────────┐
│ <Step name="running">                           │
│   <Running {...props} />                        │
│   props = {                                     │
│     user,                    ◄─ Full object     │
│     prolificToken,           ◄─ User's token    │
│     activeExperiment,        ◄─ Selected exp    │
│     projectName,             ◄─ Project name    │
│     functions: { ... },      ◄─ Callbacks       │
│   }                                             │
│ </Step>                                         │
└─────────────────────────────────────────────────┘
         │
         ▼
    Running.js accesses:
    this.props.user.currentExperiment  ◄─ Contains all parameters
    this.props.prolificToken
    this.props.activeExperiment
    this.props.projectName


FUNCTION CALL CHAIN
Running.js
  │
  └─► prolificCreateDraft(
        user,                        ◄─ Entire user object
        projectName,                 ◄─ From props
        code,                        ◄─ Generated code
        incompatibleCompletionCode,  ◄─ Generated code
        abortedCompletionCode,       ◄─ Generated code
        prolificToken                ◄─ From props
      )
        │
        └─► Inside prolificCreateDraft():
            user.currentExperiment.titleOfStudy           ◄─ Extract
            user.currentExperiment._online2Pay            ◄─ Extract
            user.currentExperiment._online4Location       ◄─ Extract
            user.currentExperiment._prolific2CompletionPath ◄─ Extract
            ... (extract 30+ properties)
            │
            └─► Build payload object
                └─► POST to Netlify function
                    └─► Prolific API
```

### Diagram 4: Completion Code Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│ USER CLICKS "Create Prolific Study" BUTTON               │
└──────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────┐
│ Check if completion codes already exist                   │
│ const hasCompletionCode = !!completionCode               │
└──────────────────────────────────────────────────────────┘
         YES │          │ NO
            │          ▼
        SKIP │    ┌────────────────────────────────────┐
            │    │ generateAndUploadCompletionURL()    │
            │    ├────────────────────────────────────┤
            │    │ Generate 3 codes:                   │
            │    │  1. code = "456"                    │
            │    │  2. incompatibleCC = "XYZ1234"      │
            │    │  3. abortedCC = "ABC123"            │
            │    │                                     │
            │    │ Save to GitLab:                     │
            │    │ recruitmentServiceConfig.csv        │
            │    │  - code                             │
            │    │  - incompatibleCompletionCode       │
            │    │  - abortedCompletionCode            │
            │    │  - study URL                        │
            │    │                                     │
            │    │ Return to Running.js:               │
            │    │ { code, incomp..., aborted... }     │
            └────────────────────────────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ Store in component state:    │
    │ this.setState({              │
    │   completionCode: code       │
    │ })                           │
    │ (Avoid regenerating if       │
    │  button clicked again)       │
    └──────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────┐
│ Pass all 3 codes to prolificCreateDraft():              │
│  - code (main completion)                                │
│  - incompatibleCompletionCode (device incompatibility)   │
│  - abortedCompletionCode (aborted submission)            │
└──────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────┐
│ Inside prolificCreateDraft():                            │
│ Build completion_codes array:                            │
│                                                          │
│ completion_codes: [                                      │
│   {                                                      │
│     code: "456",                                         │
│     code_type: "COMPLETED",                              │
│     actions: [                                           │
│       { action: "AUTO_APPROVE" }  OR                     │
│       { action: "MANUALLY_REVIEW" }                      │
│     ]                                                    │
│   },                                                     │
│   {                                                      │
│     code: "XYZ1234",                                     │
│     code_type: "INCOMPATIBLE_DEVICE",                    │
│     actions: [                                           │
│       { action: "REQUEST_RETURN" }                       │
│     ]                                                    │
│   },                                                     │
│   {                                                      │
│     code: "ABC123",                                      │
│     code_type: "ABORTED",                                │
│     actions: [                                           │
│       { action: "AUTO_APPROVE" } OR                      │
│       { action: "MANUALLY_REVIEW" } OR                   │
│       { action: "REQUEST_RETURN" }                       │
│     ]                                                    │
│   }                                                      │
│ ]                                                        │
└──────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────┐
│ POST payload with completion_codes to Prolific API       │
└──────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────┐
│ PROLIFIC STORES CODES                                    │
│                                                          │
│ When participant completes experiment:                   │
│ - Returns completion code to Prolific                    │
│ - Prolific checks code type                              │
│ - Executes corresponding action                          │
│   (auto-approve, request return, etc.)                   │
└──────────────────────────────────────────────────────────┘
```

---

## Summary Table

| Component           | File                                        | Purpose                           | Input                    | Output                       |
| ------------------- | ------------------------------------------- | --------------------------------- | ------------------------ | ---------------------------- |
| Table               | `/source/Table.js`                          | Upload & process experiment file  | CSV/Excel file           | `user.currentExperiment`     |
| App                 | `/source/App.js`                            | Root state management             | File via Table           | State with currentExperiment |
| Running             | `/source/Running.js`                        | Manage execution & recruitment    | user, token, props       | Prolific study creation      |
| prolificIntegration | `/source/components/prolificIntegration.js` | Build & send Prolific API request | currentExperiment, codes | Study draft response         |
| Netlify Function    | `/.netlify/functions/prolific/`             | Proxy API calls                   | Request                  | Prolific API response        |

---

## Key Takeaways

1. **Data Origin**: All experiment parameters come from a spreadsheet file uploaded in the Table step
2. **Storage**: Parameters are stored in `user.currentExperiment` object in App state
3. **Propagation**: Object flows to Running.js component via props
4. **Completion Codes**: Generated once and stored in component state to avoid regeneration
5. **API Payload**: Built from currentExperiment properties, transformation happens in `prolificCreateDraft()`
6. **Proxy Pattern**: Client sends to Netlify function which forwards to Prolific API
7. **State Management**: User object is copied and passed through multiple components with immutable updates

---

_Document Generated: 2025-11-17_
_Last Updated: 2025-11-17_
