export default {
    root:{
        code:'000000',
        name:'中华人民共和国',
        short:'中国',
        level:'country',
        group:'country',
        parentCode:''
    },
    match:{
        code:/^(\d{2})(\d{2})(\d{2})$/,
        province: /(省|市|特别行政区)/,
        city: /(市|地区|自治州|盟)/,
        district: /(市|区|自治县|县|自治旗|旗|特区|林区)/
    }
};