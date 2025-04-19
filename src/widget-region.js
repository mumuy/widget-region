import {getItem,getList,getChildren,getTree} from './module/method.js';
import styleSheet from './style/default.css' with { type: 'css'};

class WidgetRegion extends HTMLElement {
    static formAssociated = true;
    #internals;
    #isLoaded = false;
    #cache;
    #province;
    #city;
    #district;
    constructor() {
        super();
        const _ = this;
        _.#internals = this.attachInternals();
        _.attachShadow({mode:'open'});
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
            if(_.device=='mobile'||globalThis?.innerWidth<600){
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
                let offset;
                if($province){
                    offset = $province.getBoundingClientRect().top-$province.parentNode.getBoundingClientRect().top+$province.parentNode.scrollTop||0;
                    offset -= _.$pickerBody.clientHeight/2 - 16;
                    _.$provinceList.scrollTo({top:offset,behavior:'instant'});
                }
                if($city){
                    offset = $city.getBoundingClientRect().top-$city.parentNode.getBoundingClientRect().top+$city.parentNode.scrollTop||0;
                    offset -= _.$pickerBody.clientHeight/2 - 16;
                    _.$cityList.scrollTo({top:offset,behavior:'instant'});
                }
                if($district){
                    offset = $district.getBoundingClientRect().top-$district.parentNode.getBoundingClientRect().top+$district.parentNode.scrollTop||0;
                    offset -= _.$pickerBody.clientHeight/2 - 16;
                    _.$districtList.scrollTo({top:offset,behavior:'instant'});
                }
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
                _.dispatchEvent(new UIEvent('change')); 
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
                    _.dispatchEvent(new UIEvent('input'));
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
    initData(){
        const _ = this;
        // 解析文本中的行政区划信息
        if(!_.code&&(_.value||_.province||_.city||_.district)){
            let value = _.value.replace(/[^\u4e00-\u9fa5]/g,'');
            getList().forEach(({level,code,name,short})=>{
                if(_.code&&code.indexOf(_.code.replace(/0+$/,''))!=0){
                    return false;
                } 
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
        _.$province.innerText = '';
        _.$city.innerText = '';
        _.$district.innerText = '';
        if(code){
            _.code = code;
        }
        const children = getChildren(_.code);
        if(children.length){
            _.$picker.setAttribute('data-group',children[0]['group']);
        }else{
            const item = getItem(_.code);
            _.$picker.setAttribute('data-group',item['group']);
        }
        getTree(_.code).forEach(function({code,name,group},index){
            if(group=='province'){
                _.#province = code;
                _.province = name;
            }else if(group=='city'){
                _.#city = code;
                _.city = name;
            }else if(group=='district'){
                _.#district = code;
                _.district = name;
            }
        });
        let value = _.province+(_.city?' / '+_.city:'')+(_.district?' / '+_.district:'');
        _.$input.value = value;
        _.value = value.replace(/[\s\/]/g,'');
        _.#internals.setFormValue(_.value);
        // 省级
        _.$province.innerText =  _.province||'请选择';
        _.$province.setAttribute('data-code','000000');
        _.$provinceList.innerHTML = getChildren().map(({code,name})=>{
            return `<li class="${getChildren(code).length?'more':''} ${code==_.#province?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
        }).join('');
        // 地级
        let hasCity = _.#province&&getChildren(_.#province).find(item=>item.group=='city')?true:false;
        if(hasCity){
            _.$city.innerText = _.city||(hasCity?'请选择':'');
            _.$city.setAttribute('data-code',_.#province);
            _.$cityList.innerHTML = getChildren(_.#province).map(({code,name})=>{
                return `<li class="${getChildren(code).length?'more':''} ${code==_.#city?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
            }).join('');
        }else{
            _.$cityList.innerHTML = '';
        }
        // 区县级
        let hasDistrict_province = _.#province&&getChildren(_.#province).find(item=>item.group=='district')?true:false;
        let hasDistrict_city = _.#city&&getChildren(_.#city).find(item=>item.group=='district')?true:false;
        if(hasDistrict_province){
            _.$district.innerText = _.district||(hasDistrict_province?'请选择':'');
            _.$district.setAttribute('data-code',_.#province);
            _.$districtList.innerHTML = getChildren(_.#province).map(({code,name})=>{
                return `<li class="${getChildren(code).length?'more':''} ${code==_.#district?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
            }).join('');
        }else if(hasDistrict_city){
            _.$district.innerText = _.district||(hasDistrict_city?'请选择':'');
            _.$district.setAttribute('data-code',_.#city);
            _.$districtList.innerHTML = getChildren(_.#city).map(({code,name})=>{
                return `<li class="${getChildren(code).length?'more':''}${code==_.#district?'active':''}" data-code="${code}">${name?`<span>${name}</span>`:``}</li>`;
            }).join('');
        }else{
            _.$districtList.innerHTML = '';
        }
        if(!_.#province){
            _.$provinceList.scrollTo({top:0,behavior:'instant'});
        }
        if(!_.#city){
            _.$cityList.scrollTo({top:0,behavior:'instant'});
        }
        if(!_.#district){
            _.$districtList.scrollTo({top:0,behavior:'instant'});
        }
    }
}

if(!customElements.get('widget-region')){
    customElements.define('widget-region', WidgetRegion);
}