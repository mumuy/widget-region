export default {
    root:{
        code:'00000',
        name:'美属萨摩亚',
        short:'美属萨摩亚',
        level:'country',
        group:'country',
        parentCode:''
    },
    match:{
        code:/^(\d{2})(\d{3})$/,
        province: /(区|礁|岛)/,
        city: /(县)/,
        district: null
    }
};