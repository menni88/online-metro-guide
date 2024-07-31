const governmentGovernorates = {
    '01': 'Cairo',
    '02': 'Alexandria',
    '03': 'Port Said',
    '04': 'Suez',
    '11': 'Damietta',
    '12': 'Dakahlia',
    '13': 'Ash Sharqia',
    '14': 'Kaliobeya',
    '15': 'Kafr El - Sheikh',
    '16': 'Gharbia',
    '17': 'Monoufia',
    '18': 'El Beheira',
    '19': 'Ismailia',
    '21': 'Giza',
    '22': 'Beni Suef',
    '23': 'Fayoum',
    '24': 'El Menia',
    '25': 'Assiut',
    '26': 'Sohag',
    '27': 'Qena',
    '28': 'Aswan',
    '29': 'Luxor',
    '31': 'Red Sea',
    '32': 'New Valley',
    '33': 'Matrouh',
    '34': 'North Sinai',
    '35': 'South Sinai',
    '88': 'Foreign'
  };
  exports.calculateDateOfBirthAndgovernment= (nationalId) => {
    
    const dobString = nationalId.substring(1, 7);
    const century = nationalId[0] === '2' ? '19' : '20';
    const birthYear = century + dobString.substring(0, 2);
    const birthMonth = dobString.substring(2, 4);
    const birthDay = dobString.substring(4, 6); 
    const governorateCode = nationalId.substring(7, 9);
  
    let government = governmentGovernorates[governorateCode] || 'Unknown';
  
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
  
    let age = currentYear - parseInt(birthYear);
  
    if (currentMonth < parseInt(birthMonth) || (currentMonth === parseInt(birthMonth) && currentDay < parseInt(birthDay))) {
      age--;
    }
  
    const dateOfBirth = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
  
    
    const formattedDateOfBirth = dateOfBirth.toLocaleDateString();
  
    return { dateOfBirth: formattedDateOfBirth, government, age: age.toString() };
  };
  
 
  