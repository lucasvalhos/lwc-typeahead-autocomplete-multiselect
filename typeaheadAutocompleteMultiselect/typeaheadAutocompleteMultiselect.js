import { LightningElement, api } from 'lwc';

const ARROW_UP = 'ArrowUp'
const ARROW_DOWN = 'ArrowDown'
const ENTER = 'Enter'
const ESCAPE = 'Escape'
const ACTIONABLE_KEYS = [ ARROW_UP, ARROW_DOWN, ENTER, ESCAPE ]

export default class TypeaheadAutocompleteMultiselect extends LightningElement {
    
    @api values;
    @api hasSearchResults;
    @api label = '';
    @api placeholder = '';
    @api required;

    searchText = '';
    activeId;
    filteredValues = [];
    selectedValues = [];
    
    get vFilteredValues(){
        return this.filteredValues.map(v => {
            if(v.id == this.activeId){
                v.classes = 'active';
            }else{
                v.classes = '';
            }
            return v;
        });
    }

    initialized = false;

    renderedCallback() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.selectedValues = JSON.parse(JSON.stringify(this.values)).filter(v => v.selected);
    }

    handleChange(evt) {
        console.log(JSON.stringify(event.target.value));
        this.values = this.values.map(v => {
            if(v.id == event.target.dataset.id){
                v.selected = true;
            }
        });
        this.dispatchEvent(new CustomEvent('add', { bubbles: false, detail: { value: evt.target.value } }));
    }

    onKeyup (event) {
        this.searchText = event.target.value
        this.error = null

        const keyAction = {
            ArrowUp: () => { this.cycleActive(false) },
            ArrowDown: () => { this.cycleActive(true) },
            Enter: () => { this.selectItemkeyup() },
            Escape: () => { this.clearSelection() }
        }

        if (ACTIONABLE_KEYS.includes(event.code)) {
           
            keyAction[event.code]()

        } else {
            if (event.target.value.length > 0) {
                //this.debounceSearch()
                this.filteredValues = JSON.parse(JSON.stringify(this.values)).filter(v => v.name.toLowerCase().includes(event.target.value.toLowerCase()) && !v.selected);
                this.hasSearchResults = true;
            }else{
                this.hasSearchResults = false;
            }

        }
    }

    cycleActive (forwards) {
        const currentIndex = this.filteredValues.findIndex(v => v.id == this.activeId);
        console.log(currentIndex, this.filteredValues.length);
        if (currentIndex === -1 || currentIndex === (this.filteredValues.length - 1)) {
            this.activeId = this.filteredValues[0].id;
        } else if (!forwards && currentIndex === 0) {
            this.activeId = this.filteredValues[this.filteredValues.length - 1].id;
        } else if (forwards) {
            this.activeId = this.filteredValues[currentIndex + 1].id;
        } else {
            this.activeId = this.filteredValues[currentIndex - 1].id;
        }
    }

    selectItem(event){
        this.hasSearchResults = false;
        this.searchText = null;
        this.selectedValues.push(this.values.find(v=>v.id == event.target.dataset.id));
        this.values = JSON.parse(JSON.stringify(this.values)).map(v => {
            if(v.id == event.target.dataset.id){
                console.log(v);
                v.selected = true;
            }
            return v;
        });
        // fires event
    }

    selectItemkeyup(){
        this.hasSearchResults = false;
        this.searchText = null;
        this.selectedValues.push(this.values.find(v => v.id == this.activeId));
        this.values = JSON.parse(JSON.stringify(this.values)).map(v => {
            if(v.id == this.activeId){
                console.log(v);
                v.selected = true;
            }
            return v;
        });
        this.activeId = null;
        // fires event
    }

    removeItem(event){
        this.selectedValues = this.selectedValues.filter(v => v.id != event.target.dataset.id);
        this.values = JSON.parse(JSON.stringify(this.values)).map(v => {
            if(v.id == event.target.dataset.id){
                v.selected = false;
            }
            return v;
        });
        // fires event
    }

    clearSelection(){
        this.hasSearchResults = false;
        this.searchText = null;
    }

}
