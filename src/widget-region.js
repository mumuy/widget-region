import cn from './data/cn.js';
import styleSheet from './style/default.css' with { type: 'css'};

class WidgetRegion extends HTMLElement {
    #isLoaded = false;
    #cache;
    #dataMap = cn;
    #province;
    #city;
    #district;
    #childrenMap = {};
    constructor() {
        super();
        const _ = this;
        _.attachShadow({mode:'open'});
        // 映射子级数据
        _.#childrenMap['000000'] = {};
        Object.entries(_.#dataMap).forEach(([code,name])=>{
            if(code.match(/0000$/)){
                _.#childrenMap['000000'][code] = name;
            }else if(code.match(/00$/)||code.match(/90\d{2}$/)||code.match(/^(11|12|31|50|81|82)/)){     // 地级市、省辖县级市、直辖市或特别行政区下属
                const provinceCode = code.replace(/\d{4}$/,'0000');
                if(!_.#childrenMap[provinceCode]){
                    _.#childrenMap[provinceCode] = {};
                }
                _.#childrenMap[provinceCode][code] = name;
            }else{
                const cityCode = code.replace(/\d{2}$/,'00');
                if(!_.#childrenMap[cityCode]){
                    _.#childrenMap[cityCode] = {};
                }
                _.#childrenMap[cityCode][code] = name;
            }
        });
        const userAgent = window.navigator.userAgent;
        _.device = userAgent.includes('Mobile')?'mobile':'desktop';
    }
    static get observedAttributes(){
        return ['value','code','province','city','district','device'];
    }
    get value(){
        return this.getAttribute('value')||'';
    }
    set value(value){
        return this.setAttribute('value',value);
    }
    get code(){
        return this.getAttribute('code')||'';
    }
    set code(value){
        return this.setAttribute('code',value);
    }
    get province(){
        return this.getAttribute('province')||'';
    }
    set province(value){
        return this.setAttribute('province',value);
    }
    get city(){
        return this.getAttribute('city')||'';
    }
    set city(value){
        return this.setAttribute('city',value);
    }
    get district(){
        return this.getAttribute('district')||'';
    }
    set district(value){
        return this.setAttribute('district',value);
    }
    get device(){
        return this.getAttribute('level')||'desktop';
    }
    set device(value){
        return this.setAttribute('level',value);
    }
    attributeChangedCallback(name, oldValue, newValue){
        if(oldValue!=newValue){
            this.context&&this.drawQRCode();
        }
    }
    connectedCallback () {
        let _ = this;
        // 模板
        if(_.shadowRoot.adoptedStyleSheets){
            _.shadowRoot.adoptedStyleSheets = [styleSheet];
        }else{
            const $style = document.createElement('style');
            $style.rel = 'stylesheet';
            $style.textContent = [...styleSheet.cssRules].map(item=>item.cssText).join('');
            _.shadowRoot.appendChild($style);
        }
        // 节点
        _.render();
        _.initData();
    }
    render(){
        let _ = this;
            _.shadowRoot.innerHTML = `<div class="mod-region">
                <input type="text" placeholder="请选择行政区划" readonly/>
            </div>
            <dialog id="picker" data-level="1">
                <div class="picker-container">
                    <div class="picker-head">
                        <div class="picker-title">
                            <span>地区选择</span>
                            <button class="cancel">取消</button>
                        </div>
                        <ul class="selected-list">
                            <li class="province" data-code=""></li>
                            <li class="city" data-code=""></li>
                            <li class="district" data-code=""></li>
                        </ul>
                    </div>
                    <div class="picker-body">
                        <div class="picker-content">
                            <ul class="province-list"></ul>
                            <ul class="city-list"></ul>
                            <ul class="district-list"></ul>
                        </div>
                    </div>
                </div>
            </dialog>
        `;
        _.$module = _.shadowRoot.querySelector('.mod-region');
        _.$input = _.$module.querySelector('input');
        _.$picker = _.shadowRoot.querySelector('#picker');
        _.$pickerBody = _.$picker.querySelector('.picker-body');
        _.$province = _.$picker.querySelector('.province');
        _.$city = _.$picker.querySelector('.city');
        _.$district = _.$picker.querySelector('.district');
        _.$provinceList = _.$picker.querySelector('.province-list');
        _.$cityList = _.$picker.querySelector('.city-list');
        _.$districtList = _.$picker.querySelector('.district-list');
        _.$close = _.$picker.querySelector('.cancel');
        const openPicker = function(){
            if(_.device=='mobile'){
                _.$picker.showModal();
                document.body.style.overflow = 'hidden';
            }else{
                _.$picker.show();
            }
            if(!_.#isLoaded){
                _.#isLoaded = true;
                const $province = _.$provinceList.querySelector('.active');
                const $city = _.$cityList.querySelector('.active');
                const $district = _.$districtList.querySelector('.active');
                let offset = $province.getBoundingClientRect().top-$province.parentNode.getBoundingClientRect().top+$province.parentNode.scrollTop||0;
                offset -= _.$pickerBody.clientHeight/2 - 16;
                _.$provinceList.scrollTo({top:offset,behavior:'instant'});
                offset = $city.getBoundingClientRect().top-$city.parentNode.getBoundingClientRect().top+$city.parentNode.scrollTop||0;
                offset -= _.$pickerBody.clientHeight/2 - 16;
                _.$cityList.scrollTo({top:offset,behavior:'instant'});
                offset = $district.getBoundingClientRect().top-$district.parentNode.getBoundingClientRect().top+$district.parentNode.scrollTop||0;
                offset -= _.$pickerBody.clientHeight/2 - 16;
                _.$districtList.scrollTo({top:offset,behavior:'instant'});
            }
        };
        const closePicker = function(){
            if(_.device=='mobile'){
                document.body.style.overflow = '';
            }
            _.$picker.close();
            if(_.#cache!=_.code){
                _.#cache = _.code;
                _.dispatchEvent(new CustomEvent('onChange',{'detail':{
                    value:_.value,
                    code:_.code,
                    province:_.province,
                    city:_.city,
                    district:_.district
                }}));
            }
        };
        _.$input.addEventListener('click', openPicker);
        _.$close.addEventListener('click', closePicker);
        _.$picker.addEventListener('click', (event) => {
            const $li = event.target.closest('li');
            if($li){
                const code = $li.dataset.code;
                if(code){
                    _.setValue(code);
                    _.dispatchEvent(new CustomEvent('onSelect',{'detail':{
                        value:_.value,
                        code:_.code,
                        province:_.province,
                        city:_.city,
                        district:_.district
                    }}));
                }
            }else if(event.target==_.$picker){
                closePicker();
            }
        });
        document.addEventListener('click', (event) => {
            if(_.$picker.open&&event.target!=_) {
                closePicker();
            }
        });
    }
    initData(data){
        let _ = this;
        const regex = {
            'province': /(省|市|特别行政区)/,
            'city': /(市|地区|自治州|自治州|盟)/,
            'district': /(市|区|自治县|县|自治旗|旗|特区|林区)/
        };
        // 解析文本中的行政区划信息
        if(!_.code&&(_.value||_.province||_.city||_.district)){
            let value = _.value.replace(/[^\u4e00-\u9fa5]/g,'');
            Object.entries(_.#dataMap).forEach(([code,name])=>{
                if(_.code){
                    if(code.indexOf(_.code.replace(/0+$/,''))!=0){
                        return false;
                    } 
                }
                let level = '';
                if(code.match(/0000$/)){
                    level = 'province';
                }else if(code.match(/00$/)){
                    level = 'city';
                }else{
                    level = 'district';
                }
                let short = name;
                short = name.replace(regex[level],'');
                if(value.indexOf(name)==0){
                    _.code = code;
                    value = value.replace(name,'');
                }else if(value.indexOf(short)==0){
                    _.code = code;
                    value = value.replace(short,'');
                }
                // 容错处理
                const province = _.province;
                const city = _.city||_.province;
                const district = _.district||_.city||_.province;
                // 直接填行政区等级
                if(level=='province'&&(province===name||province===short)){
                    _.code = code;
                }else if(level=='city'&&(city===name||city===short)){
                    _.code = code;
                }else if(level=='district'&&(district===name||district===short)){
                    _.code = code;
                }
            });
        }
        if(_.code){
            let c = _.code.replace(/\S{4}$/, '0000');
            if (_.#dataMap[c]) {
                _.#province = c;
            }
            c = _.code.replace(/\S{2}$/, '00');
            if (_.#dataMap[c] && c != _.#province) {
                _.#city = c;
            }
            c = !_.code.match(/00$/)? _.code : '';
            if (_.#dataMap[c] && c != _.#city) {
                _.#district = c;
            }
        }
        _.#cache = _.code;
        _.setValue(_.code);
    }
    setValue(code){
        let _ = this;
        _.province = '';
        _.city = '';
        _.district = '';
        _.#province = '';
        _.#city = '';
        _.#district = '';
        if(code){
            _.code = code;
        }
        if(_.code){
            let c = _.code.replace(/\d{4}$/, '0000');
            if (_.#dataMap[c]) {
                _.#province = c;
            }
            c = _.code.replace(/\d{2}$/, '00');
            if (_.#dataMap[c] && c != _.#province) {
                _.#city = c;
            }
            c = _.code % 100 ? _.code : '';
            if (_.#dataMap[c] && c != _.#city) {
                _.#district = c;
            }
        }
        const isTopLevel = _.code.match(/^(11|12|31|50|81|82)/);
        const isProvinceControl = _.code.match(/90\d{2}$/);
        _.province = _.#dataMap[_.#province]||'';
        _.city = _.#dataMap[_.#city]||'';
        _.district = _.#dataMap[_.#district]||'';
        let level = 'province';
        if(isProvinceControl){
            level = 'city'; 
        }else{
            if(_.province){
                level = isTopLevel?'district':'city';
            }
            if(_.city){
                level = 'district';
            }
            if(_.district){
                level = 'district';
            }
        }
        _.$picker.setAttribute('data-level',level);
        let value = _.province+(_.city?' / '+_.city:'')+(_.district?' / '+_.district:'');
        _.$input.value = value;
        _.$province.innerText =  _.province||'请选择';
        _.$city.innerText = _.city||(_.province&&!_.district?'请选择':'');
        _.$district.innerText = _.district||(_.city?'请选择':'');
        _.$province.setAttribute('data-code','000000');
        _.$provinceList.innerHTML = Object.entries(_.#childrenMap['000000']).map(([code,name])=>{
            return `<li class="${code==_.#province?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
        }).join('');
        if(isTopLevel){
            _.$cityList.innerHTML = '';
            _.$district.setAttribute('data-code',_.#province);
            _.$districtList.innerHTML = Object.entries(_.#province&&_.#childrenMap[_.#province]?_.#childrenMap[_.#province]:{}).map(([code,name])=>{
                return `<li class="${code==_.#district?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
            }).join('');
        }else{
            _.$city.setAttribute('data-code',_.#province);
            _.$cityList.innerHTML = Object.entries(_.#province&&_.#childrenMap[_.#province]?_.#childrenMap[_.#province]:{}).map(([code,name])=>{
                return `<li class="${code==_.#city||code==_.#district?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
            }).join('');
            _.$district.setAttribute('data-code',_.#city);
            _.$districtList.innerHTML = Object.entries(_.#city&&_.#childrenMap[_.#city]?_.#childrenMap[_.#city]:{}).map(([code,name])=>{
                return `<li class="${code==_.#district?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
            }).join('');
        }
        _.value = value.replace(/[\s\/]/g,'');
    }
}

if(!customElements.get('widget-region')){
    customElements.define('widget-region', WidgetRegion);
}