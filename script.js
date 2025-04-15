function calculateSalary() {
  const payLevel = document.getElementById('payLevel').value;
  const basicPay = parseFloat(document.getElementById('basicPay').value);
  const fitment = parseFloat(document.getElementById('fitment').value);
  const hraPercent = parseFloat(document.getElementById('hra').value);
  const ta = parseFloat(document.getElementById('ta').value);
  const daPercent = parseFloat(document.getElementById('da').value);

  if (!payLevel || !basicPay || !fitment) {
    alert("Please fill in all required fields.");
    return;
  }

  const revisedBasic = basicPay * fitment;
  const hra = revisedBasic * hraPercent;
  const da = revisedBasic * (daPercent / 100);
  const grossSalary = revisedBasic + hra + da + ta;

  document.getElementById('result').innerHTML = `
    <p>🧮 <strong>Estimated Revised Basic Pay:</strong> ₹${revisedBasic.toFixed(2)}</p>
    <p>🏠 <strong>HRA:</strong> ₹${hra.toFixed(2)}</p>
    <p>🧾 <strong>DA:</strong> ₹${da.toFixed(2)}</p>
    <p>🚕 <strong>TA:</strong> ₹${ta.toFixed(2)}</p>
    <hr>
    <p>💰 <strong>Total Estimated Salary:</strong> ₹${grossSalary.toFixed(2)}</p>
  `;
}
