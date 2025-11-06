export default {
    root:{
        code:'00000',
        name:'美利坚合众国',
        short:'美国',
        level:'country',
        group:'country',
        parentCode:''
    },
    match:{
        code:/^(\d{2})(\d{3})$/,
        province: /(州|特区)/,
        city: /(自治市镇|县|人口普查区|堂区|市)/,
        district: null
    }
};