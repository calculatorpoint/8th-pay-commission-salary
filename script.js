// IIFE wrapper provided by the plugin
(function(wrapperId) {
  if (!wrapperId) { console.error('Calculator Point: Missing wrapperId for script init.'); return; }

  const initCalculatorScript = function() {
    const wrapperElement = document.getElementById(wrapperId);
    if (!wrapperElement) {
        console.error('Calculator Point: Wrapper element #'+wrapperId+' not found.');
        return;
    }

    const $ = (selector) => wrapperElement.querySelector(selector);
    const $$ = (selector) => wrapperElement.querySelectorAll(selector);

    // --- Tool Script Start (8th Pay Calculator V3 - No Chart) ---
    try {
        // Input Elements
        const payLevelEl = $('#payLevelV3');
        const currentBasicPayEl = $('#currentBasicPayV3');
        const fitmentFactorEl = $('#fitmentFactorV3');
        const hraCityTypeEl = $('#hraCityTypeV3');
        const taCityTypeEl = $('#taCityTypeV3');
        const daRateEl = $('#daRateV3');
        const calculateBtn = $('#calculateBtnV3');

        // Deduction Toggles
        const npsToggle = $('#npsToggleV3');
        const cghsToggle = $('#cghsToggleV3');
        const taxToggle = $('#taxToggleV3');

        // Other Deductions Elements
        const otherDeductionsContainer = $('#otherDeductionsContainerV3');
        const addDeductionBtn = $('#addDeductionBtnV3');

        // Output Containers
        const resultContainer = $('#resultContainerV3');
        const errorContainer = $('#errorContainerV3');
        const shareContainer = $('#shareContainerV3');

        // Result Display Elements
        const resultLevelTextEl = $('#resultLevelTextV3');
        const resultInputBasicEl = $('#resultInputBasicV3');
        const resultFitmentFactorEl = $('#resultFitmentFactorV3');
        const resultRevisedBasicEl = $('#resultRevisedBasicV3');
        const resultDAInputPercentEl = $('#resultDAInputPercentV3');
        const resultDAAmountEl = $('#resultDAAmountV3');
        const resultHRAInputPercentEl = $('#resultHRAInputPercentV3');
        const resultHRAAmountEl = $('#resultHRAAmountV3');
        const resultTAAmountEl = $('#resultTAAmountV3');
        const resultGrossSalaryEl = $('#resultGrossSalaryV3');
        const resultNPSEl = $('#resultNPSV3');
        const resultCGHSEl = $('#resultCGHSV3');
        const resultIncomeTaxAnnualEl = $('#resultIncomeTaxAnnualV3');
        const resultIncomeTaxMonthlyEl = $('#resultIncomeTaxMonthlyV3');
        const resultTotalDeductionsEl = $('#resultTotalDeductionsV3');
        const resultNetSalaryEl = $('#resultNetSalaryV3');

        // --- Helper Functions ---
        const formatCurrency = (amount) => {
            if (isNaN(amount) || amount === undefined || amount === null) {
                return '₹0';
            }
            return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        };

        const calculateTA = (payLevelValue, taCityType, revisedBasic, daPercent) => {
             if (taCityType === 'no_ta') return 0;
            let baseTA = 0;
            const isHigherCity = taCityType === 'higher';
            let levelNum = 0;

            if (payLevelValue.startsWith('level-')) {
                levelNum = parseInt(payLevelValue.split('-')[1]);
            } else if (payLevelValue.startsWith('agp-')) {
                 const agpRef = payLevelValue.split('-')[1];
                 if (agpRef === '10') levelNum = 10;
                 else if (agpRef === '11') levelNum = 11;
                 else if (agpRef === '12') levelNum = 12;
                 else if (agpRef.includes('13')) levelNum = 13;
                 else if (agpRef.includes('14') || agpRef === '15') levelNum = 14;
                 else levelNum = 9;
            }

            if (levelNum >= 1 && levelNum <= 8) {
                 baseTA = isHigherCity ? 3600 : 1350;
            } else if (levelNum >= 9 && levelNum <= 13) {
                 baseTA = isHigherCity ? 7200 : 3600;
            } else if (levelNum >= 14) {
                 baseTA = isHigherCity ? 7200 : 3600;
            }

            const daOnTA = baseTA * (daPercent / 100);
            return Math.round(baseTA + daOnTA);
        };

         const calculateCGHS = (payLevelValue) => {
             let levelNum = 0;
             if (payLevelValue.startsWith('level-')) {
                 levelNum = parseInt(payLevelValue.split('-')[1]);
             } else if (payLevelValue.startsWith('agp-')) {
                  const agpRef = payLevelValue.split('-')[1];
                  if (agpRef === '10') levelNum = 10;
                  else if (agpRef === '11') levelNum = 11;
                  else if (agpRef.includes('12')) levelNum = 12;
                  else if (agpRef.includes('13')) levelNum = 13;
                  else if (agpRef.includes('14') || agpRef === '15') levelNum = 14;
                  else levelNum = 9;
             }

             if (levelNum <= 5) return 250;
             if (levelNum >= 6 && levelNum <= 9) return 450;
             if (levelNum >= 10 && levelNum <= 11) return 650;
             if (levelNum >= 12) return 1000;
             return 250;
        };

        const calculateIncomeTax = (annualGrossIncome) => {
             if (isNaN(annualGrossIncome) || annualGrossIncome <= 0) {
                 return { monthlyTax: 0, annualTax: 0 };
            }

            const standardDeduction = 50000;
            let taxableIncome = Math.max(0, annualGrossIncome - standardDeduction);
            let annualTax = 0;

            // Assumed New Regime Slabs (FY 25-26)
            if (taxableIncome <= 300000) {
                annualTax = 0;
            } else if (taxableIncome <= 600000) {
                annualTax = (taxableIncome - 300000) * 0.05;
            } else if (taxableIncome <= 900000) {
                annualTax = 15000 + (taxableIncome - 600000) * 0.10;
            } else if (taxableIncome <= 1200000) {
                annualTax = 45000 + (taxableIncome - 900000) * 0.15;
            } else if (taxableIncome <= 1500000) {
                annualTax = 90000 + (taxableIncome - 1200000) * 0.20;
            } else {
                annualTax = 150000 + (taxableIncome - 1500000) * 0.30;
            }

            // Rebate u/s 87A
            if (taxableIncome <= 700000) {
                annualTax = 0;
            }

            // Cess (4%)
            if (annualTax > 0) {
               const cess = annualTax * 0.04;
               annualTax += cess;
            }

            annualTax = Math.max(0, annualTax);
            const monthlyTax = Math.round(annualTax / 12);
            return { monthlyTax: monthlyTax, annualTax: Math.round(annualTax) };
        };

        const addDeductionRow = () => {
             const rowCount = $$('#otherDeductionsContainerV3 .other-deduction-row').length;
             const newRow = document.createElement('div');
             newRow.className = 'other-deduction-row';
             newRow.innerHTML = `
                 <input type="text" placeholder="Deduction Name ${rowCount + 1}" class="other-deduction-name">
                 <input type="number" placeholder="Amount" min="0" step="1" class="other-deduction-amount">
                 <button type="button" class="remove-deduction-btn" title="Remove this deduction">X</button>
             `;
             otherDeductionsContainer.appendChild(newRow);
             newRow.querySelector('.remove-deduction-btn').addEventListener('click', handleRemoveDeduction);
             newRow.querySelector('.other-deduction-amount').addEventListener('input', performCalculation);
             newRow.querySelector('.other-deduction-name').addEventListener('input', performCalculation);
             performCalculation(); // Recalculate
        };

        const handleRemoveDeduction = (event) => {
            event.target.closest('.other-deduction-row').remove();
            performCalculation();
        };

        addDeductionBtn.addEventListener('click', addDeductionRow);

        // --- Chart Update Function Removed ---

        const updateShareButtonsV3 = (levelText, netSalary) => {
            const text = `My projected 8th CPC Net Salary (Level: ${levelText}) is approx. ${formatCurrency(netSalary)}! Calculate yours:`;
            const url = window.location.href;
            const encodedText = encodeURIComponent(text);
            const encodedUrl = encodeURIComponent(url);
            const twitterSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .79 13.58a6.56 6.56 0 0 1-.707-.04 9.284 9.284 0 0 0 5.026 1.457z"/></svg>`;
            const whatsappSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.1-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>`;
            const emailSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z"/></svg>`;
            const copySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>`;

            shareContainer.innerHTML = `
                <p>Share this projection:</p>
                <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" class="share-button-twitter" title="Share on Twitter">${twitterSVG} Tweet</a>
                <a href="https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}" target="_blank" class="share-button-whatsapp" title="Share on WhatsApp">${whatsappSVG} WhatsApp</a>
                <a href="mailto:?subject=Projected%208th%20CPC%20Salary&body=${encodedText}%20${encodedUrl}" class="share-button-email" title="Share via Email">${emailSVG} Email</a>
                 <button type="button" id="copyShareTextBtnV3" class="share-button-copy" title="Copy result text">${copySVG} Copy Text</button>
            `;
            const copyBtn = $('#copyShareTextBtnV3');
            if(copyBtn) { copyBtn.onclick = () => { copyShareText(text, url, copyBtn); }; }
        };

         const copyShareText = (text, url, button) => {
             const textToCopy = `${text} ${url}`;
             navigator.clipboard.writeText(textToCopy).then(() => {
                 const originalHTML = button.innerHTML;
                 button.innerHTML = 'Copied!';
                 button.disabled = true;
                 setTimeout(() => { button.innerHTML = originalHTML; button.disabled = false; }, 2000);
             }).catch(err => { console.error('Failed to copy text: ', err); alert('Could not copy text automatically.'); });
         };

        const performCalculation = () => {
             errorContainer.style.display = 'none';
             errorContainer.textContent = '';

            const payLevelValue = payLevelEl.value;
            const selectedLevelOption = payLevelEl.options[payLevelEl.selectedIndex];
            const levelText = selectedLevelOption ? selectedLevelOption.text : 'N/A';
            const currentBasic = parseFloat(currentBasicPayEl.value);
            const fitmentFactor = parseFloat(fitmentFactorEl.value);
            const hraPercent = parseFloat(hraCityTypeEl.value);
            const taCityType = taCityTypeEl.value;
            const daPercent = parseFloat(daRateEl.value) || 0;

            if (!payLevelValue || isNaN(currentBasic) || currentBasic <= 0 || isNaN(fitmentFactor) || isNaN(hraPercent) || !taCityType || isNaN(daPercent) || daPercent < 0) {
                 if (document.activeElement === calculateBtn || resultContainer.style.display === 'block') {
                     errorContainer.textContent = 'Please fill all base fields with valid values.';
                     errorContainer.style.display = 'block';
                 }
                 resultContainer.style.display = 'none';
                 return;
            }

             const revisedBasic = Math.round(currentBasic * fitmentFactor);
             const daAmount = Math.round(revisedBasic * (daPercent / 100));
             const hraAmount = Math.round(revisedBasic * hraPercent);
             const taAmount = calculateTA(payLevelValue, taCityType, revisedBasic, daPercent);
             const grossSalary = revisedBasic + daAmount + hraAmount + taAmount;

             let totalDeductions = 0;
             let npsDeduction = 0;
             let cghsDeduction = 0;
             let monthlyTax = 0;
             let annualTax = 0;

             if (npsToggle.checked) {
                 npsDeduction = Math.round((revisedBasic + daAmount) * 0.10);
                 totalDeductions += npsDeduction;
             }
             if (cghsToggle.checked) {
                 cghsDeduction = calculateCGHS(payLevelValue);
                 totalDeductions += cghsDeduction;
             }

             const annualGrossIncome = grossSalary * 12;
             const taxInfo = calculateIncomeTax(annualGrossIncome);
             monthlyTax = taxInfo.monthlyTax;
             annualTax = taxInfo.annualTax;

             if (taxToggle.checked) {
                 totalDeductions += monthlyTax;
             }

             let otherDeductionsTotal = 0;
             $$('#otherDeductionsContainerV3 .other-deduction-row').forEach(row => {
                 const amountInput = row.querySelector('.other-deduction-amount');
                 const amount = parseFloat(amountInput.value) || 0;
                 if (amount > 0) {
                     otherDeductionsTotal += amount;
                 }
             });
             totalDeductions += otherDeductionsTotal;

             const netSalary = grossSalary - totalDeductions;

             // Update UI
             resultLevelTextEl.textContent = levelText;
             resultInputBasicEl.textContent = formatCurrency(currentBasic);
             resultFitmentFactorEl.textContent = fitmentFactor.toFixed(2);
             resultRevisedBasicEl.textContent = formatCurrency(revisedBasic);

             resultDAInputPercentEl.textContent = daPercent;
             resultDAAmountEl.textContent = formatCurrency(daAmount);
             resultHRAInputPercentEl.textContent = (hraPercent * 100).toFixed(0);
             resultHRAAmountEl.textContent = formatCurrency(hraAmount);
             resultTAAmountEl.textContent = formatCurrency(taAmount);

             resultGrossSalaryEl.textContent = formatCurrency(grossSalary);

             resultNPSEl.textContent = npsToggle.checked ? formatCurrency(npsDeduction) : '₹0';
             resultCGHSEl.textContent = cghsToggle.checked ? formatCurrency(cghsDeduction) : '₹0';
             resultIncomeTaxMonthlyEl.textContent = taxToggle.checked ? formatCurrency(monthlyTax) : '₹0';
             resultIncomeTaxAnnualEl.textContent = taxToggle.checked ? `(${formatCurrency(annualTax)} approx pa)` : '(Disabled)';

             resultTotalDeductionsEl.textContent = formatCurrency(totalDeductions);
             resultNetSalaryEl.textContent = formatCurrency(netSalary);

             resultContainer.style.display = 'block';
             // updateChartV3 removed
             updateShareButtonsV3(levelText, netSalary);
        };

        // --- Initial Setup & Event Listeners ---
        calculateBtn.addEventListener('click', performCalculation);

        // Automatic recalculation listeners
        [payLevelEl, fitmentFactorEl, hraCityTypeEl, taCityTypeEl, npsToggle, cghsToggle, taxToggle].forEach(el => {
            if(el) el.addEventListener('change', performCalculation);
        });
        [currentBasicPayEl, daRateEl].forEach(el => {
             if(el) el.addEventListener('input', performCalculation);
         });

    } catch(e) {
        console.error('Calculator Point: Error executing script V3 inside #'+wrapperId+':', e);
        if(errorContainer){
             errorContainer.textContent = 'An unexpected error occurred. Please check browser console.';
             errorContainer.style.display = 'block';
        }
        if(resultContainer) resultContainer.style.display = 'none';
    }

  }; // End initCalculatorScript function

  if (document.readyState === 'loading') {
     document.addEventListener('DOMContentLoaded', initCalculatorScript);
  } else {
     initCalculatorScript();
  }

})(wrapperId); // Pass wrapperId
// --- End of Plugin Integration ---