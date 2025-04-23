import dataMap from './data/cn.js';
import rule from './rule/cn.js';

const childrenMap = {};
Object.entries(dataMap).forEach(([code])=>{
    let {name,parentCode} = getItem(code);
    if(!childrenMap[parentCode]){
        childrenMap[parentCode] = {};
    }
    childrenMap[parentCode][code] = name;
});

// 获取当前行政区信息
export function getItem(code = rule.root.code){
    if(dataMap[code]){
        let name = dataMap[code];
        let level = '';                     // 实际行政级别
        let group = '';                     // 面板归组基本
        let parentCode = rule.root.code;    // 父代码
        let [c,provinceCode,cityCode,districtCode] = code.match(rule.match.code);
        let codeEnd = '';
        if(districtCode&&districtCode.match(/[^0]/)){
            level = group = 'district';
            codeEnd = districtCode;
            parentCode = code.replace(new RegExp(codeEnd+'$'),'0'.repeat(codeEnd.length));
            if(!dataMap[parentCode]){
                group = 'city';
                codeEnd = cityCode + districtCode;
                parentCode = code.replace(new RegExp(codeEnd+'$'),'0'.repeat(codeEnd.length));
            }
        }else if(cityCode&&cityCode.match(/[^0]/)){
            level = group = 'city';
            codeEnd = cityCode + districtCode;
            parentCode = code.replace(new RegExp(codeEnd+'$'),'0'.repeat(codeEnd.length));
            if(!dataMap[parentCode]){
                group = 'province';
                codeEnd = provinceCode+cityCode+districtCode;
                parentCode = code.replace(new RegExp(codeEnd+'$'),'0'.repeat(codeEnd.length));
            }
        }else if(provinceCode&&provinceCode.match(/[^0]/)){
            level = group = 'province';
        }
        let short = name.replace(rule.match[level],'');
        return {
            code,
            name,
            short,
            level,
            group,
            parentCode,
        };
    }
    return rule.root;
};

// 获取子行政区列表
export function getChildren(code = rule.root.code){
    return childrenMap[code]?Object.entries(childrenMap[code]).map(([code])=>getItem(code)):[];
};

// 获取全部行政区列表
export function getList(){
    return Object.entries(dataMap).map(([code])=>getItem(code));
};

// 获取当前行政区各级归属
export function getTree(code = rule.root.code){
    let result = [];
    let item = getItem(code);
    while(item?.parentCode){
        result.push(item);
        item = getItem(item['parentCode']);
    }
    return result.reverse();
};