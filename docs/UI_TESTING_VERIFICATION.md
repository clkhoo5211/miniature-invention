# UI Testing Verification Guide

**Date**: 2025-01-02  
**Purpose**: Step-by-step verification guide for testing all UI flows

---

## 🚀 Quick Start Testing

### Prerequisites
1. ✅ Dev server running (`npm run dev`)
2. ✅ MetaMask installed and configured
3. ✅ Browser console open (F12)

### Testing Order
1. **Onboarding Flow** (First-time user)
2. **Navigation & Wallet** (Verify navbar functionality)
3. **Deposit Flow** (Complete deposit transaction)
4. **Withdraw Flow** (Complete withdrawal)
5. **Dashboard** (View balances and activity)
6. **Pools Pages** (Browse pool statistics)
7. **History & Relayers** (Check transaction history and quotes)

---

## 1. Onboarding Flow (`/onboarding`)

### Test Steps
1. Navigate to `/onboarding`
2. **Step 1: KYC Verification**
   - [ ] "Connect ICP Internet Identity" button visible
   - [ ] Click button → redirects to ICP
   - [ ] Authenticate → redirects back
   - [ ] ICP Principal displayed
   - [ ] "Continue" button appears
   - [ ] Click "Continue" → advances to Step 2

3. **Step 2: Wallet Connection**
   - [ ] "Connect MetaMask" button visible
   - [ ] Click button → MetaMask popup appears
   - [ ] Approve connection
   - [ ] Wallet address displayed
   - [ ] "Continue" button enabled
   - [ ] Click "Continue" → advances to Step 3

4. **Step 3: Network Selection**
   - [ ] Network dropdown shows available networks
   - [ ] Wallet's current network auto-detected and pre-selected
   - [ ] Select different network → warning shown if mismatch
   - [ ] Click "Complete Onboarding"
   - [ ] If network mismatch → wallet switch attempted
   - [ ] On success → redirected to `/dashboard`

### Expected Results
- ✅ All three steps complete successfully
- ✅ Onboarding data saved to `localStorage`
- ✅ Toast notifications for errors (no alerts)
- ✅ Smooth transitions between steps

### Common Issues
- ❌ ICP redirect fails → Check `NEXT_PUBLIC_ENABLE_ICP_IDENTITY` flag
- ❌ MetaMask not detected → Install MetaMask extension
- ❌ Network switch fails → Check wallet network settings

---

## 2. Navigation & Wallet Functionality

### Test Steps
1. **Navbar Links**
   - [ ] "Pools" link works → `/pools`
   - [ ] "Dashboard" link works → `/dashboard`
   - [ ] "History" link works → `/history`
   - [ ] Logo/title link works → `/`

2. **Wallet Status Display**
   - [ ] Connected wallet address shown (shortened format)
   - [ ] Chain ID displayed in parentheses
   - [ ] Click wallet address → dropdown menu opens

3. **Wallet Dropdown Menu**
   - [ ] Shows connected address (full)
   - [ ] Shows chain ID
   - [ ] "Switch Account" option visible
   - [ ] "Disconnect Wallet" option visible
   - [ ] Click outside → menu closes

4. **Switch Account**
   - [ ] Click "Switch Account"
   - [ ] MetaMask account picker appears (or instructions shown)
   - [ ] Select different account
   - [ ] Navbar updates with new address
   - [ ] Toast notification shown

5. **Disconnect Wallet**
   - [ ] Click "Disconnect Wallet"
   - [ ] Wallet data cleared from `localStorage`
   - [ ] Redirected to `/onboarding`
   - [ ] Navbar shows "Connect Wallet" link

### Expected Results
- ✅ All navigation links work
- ✅ Wallet status updates in real-time
- ✅ Dropdown menu functions correctly
- ✅ Account switching works or shows helpful message
- ✅ Disconnect clears state properly

---

## 3. Deposit Flow (`/deposit`)

### Test Steps
1. **Navigate to Deposit Page**
   - [ ] Open `/deposit`
   - [ ] Form loads correctly

2. **Network & Asset Selection**
   - [ ] Select network (e.g., Ethereum)
   - [ ] Asset dropdown updates (ETH, USDC, USDT)
   - [ ] Select asset (e.g., ETH)
   - [ ] Selection persists

3. **Amount Input**
   - [ ] Enter valid amount (e.g., "0.1")
   - [ ] Enter invalid amount (e.g., "0") → error toast shown
   - [ ] Enter non-numeric → error toast shown

4. **Address Screening**
   - [ ] Click "Run Screening"
   - [ ] Loading state shown
   - [ ] Success → status shows "✓ Passed"
   - [ ] Failure → status shows "✗ Failed" + error toast

5. **Proof Generation**
   - [ ] After screening pass → "Generate Proof" enabled
   - [ ] Click "Generate Proof"
   - [ ] Loading state shown ("Generating...")
   - [ ] Success → status shows "✓ Complete"
   - [ ] Note generated and displayed
   - [ ] "Download Note" button appears

6. **Transaction Submission**
   - [ ] After proof complete → "Sign & Send Transaction" enabled
   - [ ] Click button
   - [ ] MetaMask popup appears
   - [ ] Sign transaction
   - [ ] Status shows "Transaction submitted..."
   - [ ] Transaction hash displayed
   - [ ] Success → "✓ Transaction confirmed!"
   - [ ] Redirected to `/dashboard` after 2 seconds

### Expected Results
- ✅ Form validation works correctly
- ✅ Toast notifications for all errors (no alerts)
- ✅ Proof generation succeeds
- ✅ Note is saved to vault
- ✅ Transaction submitted successfully
- ✅ Transaction added to history

### Common Issues
- ❌ Screening fails → Check wallet connection
- ❌ Proof generation fails → Check console for errors
- ❌ Transaction rejected → User cancelled in MetaMask

---

## 4. Withdraw Flow (`/withdraw`)

### Test Steps
1. **Navigate to Withdraw Page**
   - [ ] Open `/withdraw`
   - [ ] Form loads correctly

2. **Note Import**
   - [ ] Paste note in "Deposit Note" field
   - [ ] Valid note → amount/asset auto-filled
   - [ ] Invalid note → error toast shown
   - [ ] Note not in vault → confirmation dialog appears
   - [ ] Click "Import from Vault" → dropdown shows saved notes

3. **Destination Address**
   - [ ] Enter valid Ethereum address
   - [ ] Enter invalid address → error toast shown
   - [ ] Enter zero address → error toast shown

4. **Amount Input**
   - [ ] Enter amount or auto-filled from note
   - [ ] Invalid amount → error toast shown

5. **Relayer Selection**
   - [ ] Relayer dropdown shows active relayers
   - [ ] Select relayer
   - [ ] Enter amount in quote field
   - [ ] Click "Get Quote"
   - [ ] Quote displayed with fee and TTL
   - [ ] Success toast shown

6. **Selective Disclosure**
   - [ ] Toggle "Enable Selective Disclosure"
   - [ ] Checkbox state persists

7. **Proof Generation**
   - [ ] Click "Generate Proof"
   - [ ] Loading state shown
   - [ ] Success → status shows "✓ Complete"
   - [ ] Success toast shown

8. **Transaction Submission**
   - [ ] Click "Sign & Send Transaction"
   - [ ] MetaMask popup appears
   - [ ] Sign transaction
   - [ ] Status shows "Transaction submitted..."
   - [ ] Transaction hash displayed
   - [ ] Success → redirected to `/dashboard`

### Expected Results
- ✅ Note import works correctly
- ✅ Relayer quotes generated successfully
- ✅ Proof generation succeeds
- ✅ Transaction submitted successfully
- ✅ Disclosure bundle saved (if enabled)
- ✅ Toast notifications for all errors

---

## 5. Dashboard (`/dashboard`)

### Test Steps
1. **Navigate to Dashboard**
   - [ ] Open `/dashboard`
   - [ ] Page loads correctly

2. **Wallet Status**
   - [ ] Connected wallet address displayed
   - [ ] Chain ID displayed
   - [ ] "Switch Account" button visible
   - [ ] "Disconnect" button visible

3. **Balance Loading**
   - [ ] Loading state shown initially
   - [ ] Balances load for selected network assets
   - [ ] Balances displayed (6 decimal places)
   - [ ] "Refresh" button visible

4. **Balance Refresh**
   - [ ] Click "Refresh" button
   - [ ] Loading spinner shown
   - [ ] "Refreshing..." text displayed
   - [ ] Button disabled during refresh
   - [ ] Success toast shown on completion
   - [ ] Balances updated

5. **Network Selection**
   - [ ] Select different network from dropdown
   - [ ] Balances reload for new network
   - [ ] Asset list updates

6. **Recent Activity**
   - [ ] Recent transactions displayed (up to 5)
   - [ ] Transaction type, amount, asset shown
   - [ ] Transaction hash displayed
   - [ ] Explorer link works
   - [ ] Empty state shown if no history

7. **Wallet Management**
   - [ ] Click "Switch Account" → MetaMask prompt
   - [ ] Click "Disconnect" → state cleared, redirected to onboarding

### Expected Results
- ✅ All balances load correctly
- ✅ Refresh button works
- ✅ Network switching works
- ✅ Recent activity displays correctly
- ✅ Explorer links work
- ✅ Toast notifications for errors

---

## 6. Pools Pages

### Test Steps
1. **Pools Index (`/pools`)**
   - [ ] Navigate to `/pools`
   - [ ] Asset list displayed (ETH)
   - [ ] Denominations shown for each asset
   - [ ] Links to pool detail pages work

2. **Pool Detail (`/pools/[asset]/[denom]`)**
   - [ ] Navigate to `/pools/ETH/1`
   - [ ] Pool title displayed
   - [ ] "Back to Pools" link works
   - [ ] Enhanced pool statistics displayed
   - [ ] Anonymity set count shown
   - [ ] Recent deposits displayed
   - [ ] "Deposit" button works → `/deposit`
   - [ ] "Withdraw" button works → `/withdraw`

### Expected Results
- ✅ All pool pages load correctly
- ✅ Statistics display correctly
- ✅ Navigation links work
- ✅ No console errors

---

## 7. History & Relayers

### Test Steps
1. **History Page (`/history`)**
   - [ ] Navigate to `/history`
   - [ ] Transaction list displayed
   - [ ] Transaction details shown (type, amount, asset, network)
   - [ ] Timestamp displayed
   - [ ] Transaction hash displayed
   - [ ] Empty state if no history

2. **Relayers Page (`/relayers`)**
   - [ ] Navigate to `/relayers`
   - [ ] Network selector visible
   - [ ] Active relayers listed for selected network
   - [ ] Relayer details shown (name, fee, SLA, risk)
   - [ ] Enter amount in quote field
   - [ ] Click "Get Quote" → quote displayed
   - [ ] Success toast shown
   - [ ] Error toast if quote fails

### Expected Results
- ✅ History displays all transactions
- ✅ Relayers load for each network
- ✅ Quote generation works
- ✅ Toast notifications for errors

---

## 8. Error Handling Verification

### Test Scenarios
1. **Network Errors**
   - [ ] Disconnect internet → error toasts shown
   - [ ] Invalid RPC endpoint → error toasts shown

2. **User Rejections**
   - [ ] Reject MetaMask connection → error toast
   - [ ] Reject transaction signing → error toast
   - [ ] Cancel account switch → warning toast

3. **Invalid Input**
   - [ ] Empty fields → validation error toasts
   - [ ] Invalid addresses → validation error toasts
   - [ ] Invalid amounts → validation error toasts

4. **Empty States**
   - [ ] No wallet connected → appropriate messages
   - [ ] No transaction history → empty state shown
   - [ ] No notes in vault → appropriate messages

### Expected Results
- ✅ All errors show toast notifications (no alerts)
- ✅ Error messages are clear and actionable
- ✅ Empty states are user-friendly
- ✅ No console errors (only expected warnings)

---

## 9. Responsive Design Verification

### Test Scenarios
1. **Mobile (< 768px)**
   - [ ] Open DevTools → Mobile view
   - [ ] All pages render correctly
   - [ ] Navigation works
   - [ ] Forms are usable
   - [ ] Buttons are tappable size

2. **Tablet (768px - 1024px)**
   - [ ] Set to tablet view
   - [ ] Layout adapts correctly
   - [ ] All features accessible

3. **Desktop (> 1024px)**
   - [ ] Full layout visible
   - [ ] Proper spacing
   - [ ] All features visible

### Expected Results
- ✅ All breakpoints work correctly
- ✅ No horizontal scrolling
- ✅ Text is readable
- ✅ Buttons are accessible

---

## 10. Browser Compatibility

### Test Browsers
1. **Chrome/Chromium**
   - [ ] All features work
   - [ ] MetaMask integration works
   - [ ] No console errors

2. **Firefox**
   - [ ] All features work
   - [ ] MetaMask integration works
   - [ ] No console errors

3. **Safari**
   - [ ] Basic features work
   - [ ] MetaMask integration works (if extension installed)
   - [ ] No console errors

---

## ✅ Testing Checklist Summary

- [ ] Onboarding flow complete
- [ ] Navigation works
- [ ] Wallet functionality works
- [ ] Deposit flow complete
- [ ] Withdraw flow complete
- [ ] Dashboard works
- [ ] Pools pages work
- [ ] History page works
- [ ] Relayers page works
- [ ] Error handling works
- [ ] Toast notifications work (no alerts)
- [ ] Responsive design works
- [ ] Browser compatibility verified

---

## 🐛 Reporting Issues

If you find issues during testing:

1. **Note the issue** with:
   - Page/component affected
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and version
   - Console errors (if any)

2. **Check console** for:
   - JavaScript errors
   - Network errors
   - React errors

3. **Verify**:
   - Wallet connection status
   - Network configuration
   - localStorage data

---

**Status**: Ready for comprehensive testing

