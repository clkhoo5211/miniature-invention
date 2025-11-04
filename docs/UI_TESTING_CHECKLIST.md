# UI Testing Checklist & Flow Documentation

**Created**: 2025-01-02  
**Purpose**: Comprehensive testing checklist for all UI flows and logic

---

## 🔄 Core User Flows

### 1. Onboarding Flow (`/onboarding`)

#### Step 1: KYC Verification
- [ ] **ICP Internet Identity Connection**
  - [ ] "Connect ICP Internet Identity" button is visible
  - [ ] Clicking button redirects to ICP authentication
  - [ ] After authentication, redirects back to `/onboarding`
  - [ ] Page detects authenticated session
  - [ ] ICP Principal ID is displayed
  - [ ] "Continue" button appears and advances to Step 2
  - [ ] Principal is stored in `localStorage` as `icpIdentity`

- [ ] **Fallback/Error Handling**
  - [ ] If ICP module not available, shows appropriate message
  - [ ] If authentication cancelled, shows error message
  - [ ] If redirect fails, shows appropriate error

#### Step 2: Wallet Connection
- [ ] **MetaMask Connection**
  - [ ] "Connect MetaMask" button is prominent
  - [ ] Clicking button prompts MetaMask popup
  - [ ] After connection, wallet address is displayed
  - [ ] Manual address entry fallback works
  - [ ] Connected state is saved to `localStorage`

- [ ] **Error Handling**
  - [ ] If MetaMask not installed, shows installation prompt
  - [ ] If user rejects connection, shows error toast
  - [ ] Invalid address format is validated and rejected

#### Step 3: Network Selection
- [ ] **Network Auto-Detection**
  - [ ] Wallet's current network is auto-detected
  - [ ] Matching network is pre-selected in dropdown
  - [ ] Warning shown if wallet network mismatches selection

- [ ] **Network Switching**
  - [ ] "Complete Onboarding" attempts to switch wallet network
  - [ ] If chain not in wallet, it's added automatically
  - [ ] If switch fails/declined, completion is blocked
  - [ ] Success message shown and redirects to dashboard

- [ ] **Validation**
  - [ ] All three steps must be completed
  - [ ] Cannot proceed without completing previous steps
  - [ ] Onboarding completion saved to `localStorage`

---

### 2. Deposit Flow (`/deposit`)

#### Prerequisites
- [ ] User has completed onboarding
- [ ] Wallet is connected

#### Network & Asset Selection
- [ ] **Network Dropdown**
  - [ ] Shows all supported networks (Ethereum, Polygon, Arbitrum, Optimism)
  - [ ] Selection persists during session
  - [ ] Asset dropdown updates based on network

- [ ] **Asset Selection**
  - [ ] Shows correct assets for selected network
  - [ ] ETH shows for Ethereum/Arbitrum/Optimism
  - [ ] MATIC shows for Polygon
  - [ ] USDC/USDT available on all networks

#### Amount Input
- [ ] **Validation**
  - [ ] Empty amount shows error
  - [ ] Zero or negative amounts show error
  - [ ] Non-numeric input shows error
  - [ ] Valid amounts pass validation

#### Address Screening
- [ ] **Screening Process**
  - [ ] "Screen Address" button triggers screening
  - [ ] Loading state shown during screening
  - [ ] Pass status allows proceeding
  - [ ] Fail status blocks proceeding with reason
  - [ ] Uses wallet's connected address

#### Proof Generation
- [ ] **Proof Flow**
  - [ ] "Generate Proof" button only enabled after screening pass
  - [ ] Loading state shown during generation
  - [ ] Proof stored in `sessionStorage`
  - [ ] Status changes to "complete"

#### Transaction Submission
- [ ] **Transaction Flow**
  - [ ] "Sign & Send Transaction" button appears after proof
  - [ ] MetaMask popup appears for signing
  - [ ] Transaction hash displayed after signing
  - [ ] Loading state shows "Waiting for confirmation..."
  - [ ] Success state shows transaction hash with explorer link
  - [ ] Note generated and saved to vault
  - [ ] Note download link appears

#### Note Management
- [ ] **Note Generation**
  - [ ] Note includes asset, amount, checksum
  - [ ] Note is saved to `localStorage` vault
  - [ ] Note can be downloaded as text file
  - [ ] Transaction record added to history

#### Error Handling
- [ ] **Error Scenarios**
  - [ ] Network RPC errors show appropriate message
  - [ ] MetaMask rejection shows error toast
  - [ ] Transaction failure shows error with details
  - [ ] Proof generation failure shows error

---

### 3. Withdraw Flow (`/withdraw`)

#### Note Import
- [ ] **Note Import Field**
  - [ ] Text area for pasting note
  - [ ] "Import from Vault" dropdown shows saved notes
  - [ ] Selecting note auto-fills amount and asset
  - [ ] Invalid note format shows error
  - [ ] Warning shown if note not in local vault

#### Destination Address
- [ ] **Address Input**
  - [ ] Validates Ethereum address format
  - [ ] Shows error for invalid addresses
  - [ ] Zero address is rejected

#### Amount Validation
- [ ] **Amount Field**
  - [ ] Auto-filled from note if available
  - [ ] Can be manually overridden
  - [ ] Validates positive number

#### Selective Disclosure
- [ ] **Disclosure Toggle**
  - [ ] Checkbox to enable disclosure
  - [ ] When enabled, disclosure bundle generated
  - [ ] Disclosure hash included in transaction

#### Relayer Selection
- [ ] **Relayer Marketplace Integration**
  - [ ] Shows active relayers for selected network
  - [ ] Dropdown to select relayer
  - [ ] "Get Quote" button calculates fee
  - [ ] Quote displays fee in ETH
  - [ ] Selected relayer passed to transaction

#### Proof Generation
- [ ] **Proof Flow**
  - [ ] "Generate Proof" button validates all inputs
  - [ ] Loading state during generation
  - [ ] Proof stored in `sessionStorage`
  - [ ] Status changes to "complete"

#### Transaction Submission
- [ ] **Transaction Flow**
  - [ ] "Sign & Send Transaction" appears after proof
  - [ ] MetaMask popup for signing
  - [ ] Transaction hash displayed
  - [ ] Waiting for confirmation state
  - [ ] Success with explorer link
  - [ ] Transaction added to history

#### Error Handling
- [ ] **Error Scenarios**
  - [ ] Invalid note format
  - [ ] Note not in vault (with confirmation)
  - [ ] Invalid destination address
  - [ ] Network/RPC errors
  - [ ] MetaMask rejection
  - [ ] Transaction failure

---

### 4. Dashboard (`/dashboard`)

#### Wallet Status
- [ ] **Connected Wallet Display**
  - [ ] Shows connected wallet address
  - [ ] Shows chain ID
  - [ ] "Switch Account" button works
  - [ ] "Disconnect" button clears state and redirects
  - [ ] Real-time updates on account/chain change

#### Balance Display
- [ ] **Balance Loading**
  - [ ] Shows loading state initially
  - [ ] Fetches balances for selected network assets
  - [ ] Displays balances in readable format (6 decimals)
  - [ ] Shows "0.000000" for failed loads
  - [ ] Error messages for failed balance fetches

- [ ] **Refresh Button**
  - [ ] "Refresh" button triggers balance reload
  - [ ] Shows loading spinner during refresh
  - [ ] Shows "Refreshing..." text
  - [ ] Success toast on completion
  - [ ] Error toast on failure
  - [ ] Button disabled during refresh

#### Network Selection
- [ ] **Network Dropdown**
  - [ ] Changes selected network
  - [ ] Triggers balance reload for new network
  - [ ] Updates asset list accordingly

#### Recent Activity
- [ ] **Transaction History**
  - [ ] Shows last 5 transactions from history
  - [ ] Displays transaction type, amount, asset, network
  - [ ] Shows timestamp
  - [ ] Shows transaction hash
  - [ ] Explorer links work correctly
  - [ ] Empty state shown when no history

#### Navigation
- [ ] **Links**
  - [ ] "Deposit" link navigates to `/deposit`
  - [ ] "Withdraw" link navigates to `/withdraw`
  - [ ] "View Full History" link navigates to `/history`

---

### 5. Pools Pages

#### Pools Index (`/pools`)
- [ ] **Pool List**
  - [ ] Shows all available asset pools
  - [ ] Displays denominations for each asset
  - [ ] Links to individual pool pages work
  - [ ] Layout is responsive

#### Pool Detail (`/pools/[asset]/[denom]`)
- [ ] **Pool Information**
  - [ ] Shows asset and denomination
  - [ ] Displays anonymity set count
  - [ ] Shows recent deposits
  - [ ] Enhanced stats component visible (if available)

- [ ] **Actions**
  - [ ] "Deposit" button navigates to `/deposit`
  - [ ] "Withdraw" button navigates to `/withdraw`
  - [ ] Pre-fills pool information in deposit/withdraw forms

---

### 6. History Page (`/history`)

- [ ] **Transaction List**
  - [ ] Loads all transactions from `localStorage`
  - [ ] Displays transaction type, amount, asset, network
  - [ ] Shows destination address (for withdrawals)
  - [ ] Shows transaction hash
  - [ ] Displays timestamp in readable format
  - [ ] Empty state when no transactions

- [ ] **Transaction Details**
  - [ ] Each transaction card is readable
  - [ ] Information is correctly formatted
  - [ ] Links to explorer (if hash present) work

---

### 7. Relayers Page (`/relayers`)

- [ ] **Relayer List**
  - [ ] Shows active relayers for selected network
  - [ ] Displays relayer name, address, fee rate
  - [ ] Network selector changes relayer list

- [ ] **Quote Generation**
  - [ ] Amount input field present
  - [ ] "Get Quote" button triggers quote calculation
  - [ ] Quote displays fee in ETH
  - [ ] Quote shows TTL (time to live)
  - [ ] Error handling for invalid amounts

- [ ] **Relayer Selection**
  - [ ] Selected relayer highlighted
  - [ ] Quote updates when relayer changes

---

### 8. Auditor Page (`/auditor`)

- [ ] **Disclosure Bundle Viewer**
  - [ ] Form to input disclosure bundle hash
  - [ ] Validates hash format
  - [ ] Retrieves and displays disclosure bundle
  - [ ] Shows transaction details
  - [ ] Shows sender/receiver information
  - [ ] Empty state when no bundle found

---

## 🧭 Navigation & Layout

### Navigation Bar
- [ ] **Links**
  - [ ] "Pools" link works
  - [ ] "Dashboard" link works
  - [ ] "History" link works
  - [ ] Logo/title links to home

- [ ] **Wallet Status**
  - [ ] Shows "Connect Wallet" when not connected
  - [ ] Shows shortened address when connected
  - [ ] Shows chain ID in parentheses
  - [ ] Dropdown menu opens on click
  - [ ] "Switch Account" option in dropdown
  - [ ] "Disconnect Wallet" option in dropdown
  - [ ] Menu closes on backdrop click
  - [ ] Real-time updates on wallet changes

### Responsive Design
- [ ] **Mobile (< 768px)**
  - [ ] Navigation adapts to mobile
  - [ ] Forms are usable on mobile
  - [ ] Buttons are tappable size
  - [ ] Text is readable

- [ ] **Tablet (768px - 1024px)**
  - [ ] Layout adapts appropriately
  - [ ] All features accessible

- [ ] **Desktop (> 1024px)**
  - [ ] Full layout with proper spacing
  - [ ] All features visible

---

## 🎨 UI Components

### Toast Notifications
- [ ] **Display**
  - [ ] Toasts appear in correct position
  - [ ] Success toasts are green
  - [ ] Error toasts are red
  - [ ] Warning toasts are yellow
  - [ ] Info toasts are blue
  - [ ] Toasts auto-dismiss after timeout
  - [ ] Toasts can be manually dismissed

- [ ] **Replaces Alerts**
  - [ ] All `alert()` calls replaced with toasts
  - [ ] Non-blocking notifications
  - [ ] Better UX than browser alerts

### Error Boundary
- [ ] **Error Handling**
  - [ ] Catches JavaScript errors
  - [ ] Displays fallback UI
  - [ ] Shows error message
  - [ ] Provides reload option
  - [ ] Logs errors to console

### Loading States
- [ ] **Loading Indicators**
  - [ ] Spinners shown during async operations
  - [ ] Buttons disabled during processing
  - [ ] Loading text indicates what's happening
  - [ ] Smooth transitions between states

---

## 🔒 Security & Validation

### Input Validation
- [ ] **Address Validation**
  - [ ] Ethereum address format validated
  - [ ] Zero address rejected
  - [ ] Invalid checksums handled

- [ ] **Amount Validation**
  - [ ] Only positive numbers accepted
  - [ ] Decimal places handled correctly
  - [ ] Empty amounts rejected
  - [ ] Non-numeric input rejected

- [ ] **Network Validation**
  - [ ] Only supported networks accepted
  - [ ] Invalid network selection handled

### Wallet Security
- [ ] **Connection Security**
  - [ ] No private keys stored
  - [ ] Only addresses stored in `localStorage`
  - [ ] Wallet prompts for all transactions
  - [ ] User must approve each action

---

## 📱 Browser Compatibility

- [ ] **Chrome/Chromium**
  - [ ] All features work
  - [ ] MetaMask integration works
  - [ ] No console errors

- [ ] **Firefox**
  - [ ] All features work
  - [ ] MetaMask integration works
  - [ ] No console errors

- [ ] **Safari**
  - [ ] Basic features work
  - [ ] MetaMask integration works (if extension installed)
  - [ ] No console errors

---

## 🐛 Known Issues & Edge Cases

### Edge Cases to Test
- [ ] **Empty States**
  - [ ] No wallet connected
  - [ ] No transaction history
  - [ ] No notes in vault
  - [ ] No relayers available

- [ ] **Network Errors**
  - [ ] RPC endpoint unreachable
  - [ ] Slow network connections
  - [ ] Timeout handling

- [ ] **User Errors**
  - [ ] Rejecting MetaMask prompts
  - [ ] Switching accounts mid-flow
  - [ ] Changing networks mid-flow
  - [ ] Closing browser mid-transaction

- [ ] **Data Persistence**
  - [ ] `localStorage` cleared
  - [ ] Browser refresh during flow
  - [ ] Multiple tabs open

---

## 📊 Test Results Log

### Test Session: [Date]
- **Tester**: [Name]
- **Browser**: [Browser/Version]
- **Wallet**: MetaMask [Version]
- **Network**: [Network]

#### Passed ✅
- [List passed tests]

#### Failed ❌
- [List failed tests with details]

#### Blocked 🚫
- [List blocked tests with reasons]

#### Notes
- [Additional observations]

---

## 🎯 Priority Testing Order

1. **Critical Path**: Onboarding → Deposit → Withdraw → Dashboard
2. **Secondary Features**: Pools, History, Relayers
3. **Edge Cases**: Error handling, empty states
4. **Cross-Browser**: Compatibility testing
5. **Responsive**: Mobile/tablet layouts

---

## 🔄 Continuous Testing

After each feature addition or bug fix:
1. Run through critical path
2. Test affected feature thoroughly
3. Check for regressions in related features
4. Update this checklist with results

