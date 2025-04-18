import dataMap from './data/cn.js';

const regex = {
    'province': /(省|市|特别行政区)/,
    'city': /(市|地区|自治州|自治州|盟)/,
    'district': /(市|区|自治县|县|自治旗|旗|特区|林区)/
};

const childrenMap = {};
Object.entries(dataMap).forEach(([code])=>{
    let {name,parentCode} = getItem(code);
    if(!childrenMap[parentCode]){
        childrenMap[parentCode] = {};
    }
    childrenMap[parentCode][code] = name;
});

// 获取当前行政区信息
export function getItem(code = '000000'){
    if(dataMap[code]){
        let name = dataMap[code];
        let level = '';     // 实际行政级别
        let group = '';     // 面板归组基本
        if(code.match(/0000$/)){
            level = 'province';
        }else if(code.match(/00$/)){
            level = 'city';
        }else{
            level = 'district';
        }
        let parentCode = '000000';
        if(code.match(/0000$/)){
            group = 'province';
        }else if(code.match(/00$/)||code.match(/90\d{2}$/)||code.match(/^(11|12|31|50|81|82)/)){
            group = 'city';
            parentCode = code.replace(/\d{4}$/,'0000');
        }else{
            group = 'district';
            parentCode = code.replace(/\d{2}$/,'00');
        }
        let short = name.replace(regex[level],'');
        return {
            code,
            name,
            short,
            level,
            group,
            parentCode,
        };
    }
    return null;
};

// 获取子行政区列表
export function getChildren(code = '000000'){
    return childrenMap[code]?Object.entries(childrenMap[code]).map(([code])=>getItem(code)):[];
};

// 获取全部行政区列表
export function getList(){
    return Object.entries(dataMap).map(([code])=>getItem(code));
};

// 获取当前行政区各级归属
export function getTree(code = '000000'){
    let result = [];
    let item = getItem(code);
    while(item){
        result.push(item);
        item = getItem(item['parentCode']);
    }
    return result.reverse();
};