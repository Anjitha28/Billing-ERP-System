/**
 * Converts a given number into its Indian numbering system equivalent in words.
 */
export function numberToWords(amount: number | string): string {
  const num = Number(amount);
  if (isNaN(num)) return "";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertWholeNumber = (n: number): string => {
    if (n === 0) return "Zero";
    let str = "";
    
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    
    const hundred = Math.floor(n / 100);
    n %= 100;
    
    if (crore > 0) str += (crore < 20 ? a[crore] : b[Math.floor(crore / 10)] + (crore % 10 !== 0 ? " " + a[crore % 10] : "")) + " Crore ";
    if (lakh > 0) str += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + (lakh % 10 !== 0 ? " " + a[lakh % 10] : "")) + " Lakh ";
    if (thousand > 0) str += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + (thousand % 10 !== 0 ? " " + a[thousand % 10] : "")) + " Thousand ";
    if (hundred > 0) str += a[hundred] + " Hundred ";
    
    if (n > 0) {
      if (str !== "") str += "and ";
      str += (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : ""));
    }
    
    return str.trim();
  };

  const strNum = num.toFixed(2);
  const parts = strNum.split(".");
  const rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);

  let result = "Rupees " + convertWholeNumber(rupees);
  
  if (paise > 0) {
    result += " and " + convertWholeNumber(paise) + " Paise";
  }
  
  return result + " Only";
}
