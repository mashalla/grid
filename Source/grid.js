/*
---

script: HtmlTable.grid.js

name: HtmlTable.grid

description: Builds an accessible Grid

license: MIT-style license

authors:
  - Christian Merz

requires:
  - Core/Hash
  - /HtmlTable
  - /HtmlSort
  - /HtmlZebra
  - /Class.refactor
  - /Element.Delegation
  - /String.Extras
  - /Date

provides: [HtmlTable.grid]

...
*/


// Refactors the Mootools HtmlTableClass
AccessibleGrid = Class.refactor(HtmlTable, {
    options: {
        gridContainer: null,
        gridname: 'grid'
    },
	// Initializes the previous class and adds accessible changes
    initialize: function(){
        this.previous.apply(this, arguments);
        
        var title = new Element('h3', {
            'html': this.options.gridname,
            'id': 'gridTitle'
        }).inject(this.options.gridContainer, 'before');
        this.options.gridContainer.setProperty('role', 'application');
        this.element.setProperties({
            'role': 'grid',
            'aria-describedby': 'gridTitle'
        });
		this.element.addClass('ariaGrid')
        this.thead = this.element.getElement('thead');
        this.tbody = this.element.getElement('tbody');
        this.currentActive = this.thead.getElement('th');
        this.selection = new Array();
        this.selectionCounter = 0;
        this.multiSelect = false;
        this.multiSelectActive = false;
        this.shift = false;
        this.interactiveMode = false;
        this.initEvents();
    },
	// Applies the previous function and adds accessible changes
    sort: function(){
        this.previous.apply(this, arguments);
		var current = document.activeElement
        current.getParent('tr').getElements('th').each(function(el){
            el.setProperty('aria-sort', 'none');
        });
        if (this.sorted.reverse) 
            current.setProperty('aria-sort', 'descending');
        else 
            current.setProperty('aria-sort', 'ascending');
    },
	// Overrides the previous function
    push: function(row, rowProperties, target, tag, where){
        if (rowProperties) {
            Object.append(rowProperties, {
                role: 'row'
            });
        }
        else {
            rowProperties = {
                role: 'row'
            };
        }
        if (typeOf(row) == 'element' && row.get('tag') == 'tr') {
            row.setProperty('role', 'row');
            row.inject(target || this.body, where);
            return {
                tr: row,
                tds: row.getChildren('td')
            };
        }
        
        var tds = row.map(function(data){
            var td = new Element(tag || 'td', data ? data.properties : {}), content = (data ? data.content : '') || data, type = typeOf(content);
            (td.get('tag') == 'th') ? td.setProperties({
                'role': 'columnheader',
                'tabindex': '-1'
            }) : td.setProperties({
                'role': 'gridcell',
                'tabindex': '-1'
            });
            if (['element', 'array', 'collection', 'elements'].contains(type)) 
                td.adopt(content);
            else 
                td.set('html', content);
            
            return td;
        });
        return {
            tr: new Element('tr', rowProperties).inject(target || this.body, where).adopt(tds),
            tds: tds
        };
    },
	// Init key events
    initEvents: function(){
        Event.Keys.f2 = 113;
        Event.Keys.f8 = 119;
        var self = this;
        self.currentActive.setProperty('tabindex', '0');
        this.thead.getElements('th').each(function(el){
            el.addEvents({
                focus: function(e){
                    self.currentActive.setProperty('tabindex', '-1');
                    self.currentActive = e.target;
                    e.target.setProperty('tabindex', '0');
                },
                click: function(e){
                    self.checkInput();
                    self.setFocus(e.target.getParent('th'));
                    self.setSelection(e.target.getParent('th'));
                },
                keydown: function(e){
                    switch (e.key) {
                        case 'right':
                            e.stop();
                            self.right(e, 'th');
                            break;
                        case 'left':
                            e.stop();
                            self.left(e, 'th');
                            break;
                        case 'down':
                            e.stop();
                            self.down(e, 'th');
                            break;
                        case 'home':
                            e.stop();
                            self.home(e, 'th')
                            break;
                        case 'end':
                            e.stop();
                            self.end(e, 'th')
                            break
                        case 'enter':
                            e.stop();
                            self.enter(e, 'th')
                            break;
                    }
                }
            });
        });
        this.tbody.getElements('td').each(function(el){
            el.addEvents({
                //dblclick: function(e){
                //    self.f2();
                //},
                click: function(e){
                    self.checkInput();
					self.f2();
                    //self.setFocus(e.target);
                    //self.setSelection(e.target);
                },
                focus: function(e){
                    self.currentActive.setProperty('tabindex', '-1');
                    self.currentActive = e.target;
                    e.target.setProperty('tabindex', '0');
                },
                keyup: function(e){
                    if (e.shift) 
                        self.shift = false;
                },
                keydown: function(e){
                    if (e.shift) {
                        self.shift = true;
                        self.setSelection(document.activeElement);
                    }
                    if (!self.interactiveMode) {
                        switch (e.key) {
                            case 'right':
                                e.stop();
                                if (e.shift) {
                                    self.shiftRight()
                                }
                                else {
                                    self.right(e, 'td')
                                }
                                break;
                            case 'left':
                                e.stop();
                                if (e.shift) {
                                    self.shiftLeft()
                                }
                                else {
                                    self.left(e, 'td')
                                }
                                break;
                            case 'up':
                                e.stop();
                                if (e.shift) {
                                    self.shiftUp()
                                }
                                else {
                                    self.up(e, 'td')
                                }
                                break;
                            case 'down':
                                e.stop();
                                if (e.shift) {
                                    self.shiftDown()
                                }
                                else {
                                    self.down(e, 'td')
                                }
                                break;
                            case 'home':
                                e.stop();
                                self.home(e, 'td')
                                break;
                            case 'end':
                                e.stop();
                                self.end(e, 'td')
                                break;
                            case 'pageup':
                                e.stop();
                                self.pageup()
                                break;
                            case 'pagedown':
                                e.stop();
                                self.pagedown()
                                break;
                            case 'space':
                                if (e.shift) {
                                    e.stop();
                                    self.shiftSpace();
                                }
                                else 
                                    if (e.control) {
                                        e.stop();
                                        self.ctrlSpace();
                                    }
                                break;
                            case 'home':
                                self.home()
                                break;
                            case 'end':
                                self.end()
                                break;
                            case 'pageup':
                                self.pageup()
                                break;
                            case 'pagedown':
                                self.pagedown()
                                break;
                            case 'a':
                                if (e.control) {
                                    e.stop();
                                    self.ctrlA();
                                }
                                break;
                            case 'f8':
                                if (e.shift) {
                                    e.stop();
                                    self.multiSelect = true;
                                    self.selectionCounter++;
                                    self.multiSelectActive = false;
                                }
                                break;
                        }
                    }
                    switch (e.key) {
                        case 'tab':
                            self.tab(e)
                            break;
                        case 'enter':
                            self.enter();
                            break;
                        case 'esc':
                            self.esc();
                            break;
                        case 'f2':
                            self.f2();
                            break;
                    }
                }
            });
        });
    },
    left: function(e, obj){
        var prev = document.activeElement.getPrevious(obj);
        this.setFocus(prev);
        this.setSelection(prev);
    },
    right: function(e, obj){
        var next = document.activeElement.getNext(obj);
        this.setFocus(next);
        this.setSelection(next);
    },
    up: function(e, obj){
        var current = document.activeElement;
        var upRow = current.getParent().getPrevious('tr');
        if (upRow) {
            var up = upRow.getElement('td:nth-child(' + this.tdPos(current) + ')');
            this.setFocus(up);
            this.setSelection(up);
        }
        else 
            if (obj == 'td') {
                var head = this.thead;
                var up = head.getElement('th:nth-child(' + this.tdPos(current) + ')');
                this.setFocus(up);
                this.setSelection(up);
            }
    },
    down: function(e, obj){
        var current = document.activeElement
        var downRow = current.getParent().getNext('tr')
        if (downRow) {
            var down = downRow.getElement('td:nth-child(' + this.tdPos(current) + ')');
            this.setFocus(down);
            this.setSelection(down);
        }
        else 
            if (obj == 'th') {
                var downRow = this.tbody.getFirst('tr');
                if (downRow) {
                    var down = downRow.getElement('td:nth-child(' + this.thPos(current) + ')');
                    this.setFocus(down);
                    this.setSelection(down);
                }
            }
    },
    tab: function(e){
        var self = this;
        if (this.interactiveMode) {
            e.stop();
            if (e.shift) {
                var current = document.activeElement.getParent();
                this.enter();
                var prev = current.getPrevious('td');
                if (!prev) {
                    var upRow = current.getParent().getPrevious('tr');
                    if (upRow) {
                        var up = upRow.getLast('td');
                        this.setFocus(up);
                        this.setSelection(up);
                    }
                    else {
                        return
                    }
                }
                
                
                this.setFocus(prev);
                this.setSelection(prev);
                setTimeout(function(){
                    self.enter();
                }, 0);
            }
            else {
                var current = document.activeElement.getParent();
                this.enter();
                var next = current.getNext('td');
                if (!next) {
                    var downRow = current.getParent().getNext('tr');
                    if (downRow) {
                        var down = downRow.getFirst('td');
                        this.setFocus(down);
                        this.setSelection(down);
                    }
                    else {
                        return
                    }
                }
                this.setFocus(next);
                this.setSelection(next);
                setTimeout(function(){
                    self.enter();
                }, 0);
            }
        }
    },
    home: function(e, obj){
        var first = document.activeElement.getParent().getFirst(obj)
        this.setFocus(first);
        this.setSelection(first);
    },
    end: function(e, obj){
        var last = document.activeElement.getParent().getLast(obj)
        if (last) {
            this.setFocus(last);
            this.setSelection(last);
        }
    },
    pageup: function(e){
        var current = document.activeElement
        var firstRow = current.getParent().getParent().getFirst('tr')
        if (firstRow) {
            var up = firstRow.getElement('td:nth-child(' + this.tdPos(current) + ')');
            if (up) {
                this.setFocus(up);
                this.setSelection(up);
            }
        }
    },
    pagedown: function(e){
        var current = document.activeElement
        var lastRow = current.getParent().getParent().getLast('tr')
        if (lastRow) {
            var down = lastRow.getElement('td:nth-child(' + this.tdPos(current) + ')');
            if (down) {
                this.setFocus(down);
                this.setSelection(down);
            }
        }
    },
    shiftSpace: function(el){
        var self = this;
        self.selection[self.selectionCounter].each(function(el){
            el.getParent().getElements('td').each(function(el){
                self.setSelection(el);
            });
        });
    },
    shiftLeft: function(e){
        var self = this;
        self.selection[self.selectionCounter].each(function(el){
            var left = el.getPrevious();
            self.setSelection(left)
        });
    },
    shiftRight: function(e){
        var self = this;
        self.selection[self.selectionCounter].each(function(el){
            var right = el.getNext();
            self.setSelection(right)
        });
    },
    shiftUp: function(e){
        var self = this;
        self.selection[self.selectionCounter].each(function(el){
            var upRow = el.getParent().getPrevious('tr')
            if (upRow) {
                var up = upRow.getElement('td:nth-child(' + self.tdPos(el) + ')');
                self.setSelection(up);
            }
        });
    },
    shiftDown: function(e){
        var self = this;
        self.selection[self.selectionCounter].each(function(el){
            var downRow = el.getParent().getNext('tr')
            if (downRow) {
                var down = downRow.getElement('td:nth-child(' + self.tdPos(el) + ')');
                self.setSelection(down);
            }
        });
    },
    ctrlSpace: function(el){
        var self = this;
        self.selection[self.selectionCounter].each(function(el){
            var pos = self.tdPos(el);
            self.tbody.getElements('tr').each(function(el){
                var tmpTd = el.getElement('td:nth-child(' + pos + ')');
                self.setSelection(tmpTd);
            });
        });
    },
    ctrlA: function(el){
        var self = this;
        self.clearSelection();
        self.tbody.getElements('td').each(function(el){
            self.setSelection(el);
        });
    },
    tdPos: function(el){
        return el.getAllPrevious('td').length + 1
    },
    trPos: function(el){
        return el.getAllPrevious('tr').length + 1
    },
    thPos: function(el){
        return el.getAllPrevious('th').length + 1
    },
    setFocus: function(el){
        if (el) {
            this.clearSelection();
            setTimeout(function(){
                el.focus();
            }, 0);
            
        }
    },
    setSelection: function(el){
        if (el) {
            if (!el.hasClass('table-td-selected')) {
                el.addClass('table-td-selected');
                el.setProperty('aria-selected', 'true');
                if (this.selection[this.selectionCounter]) 
                    this.selection[this.selectionCounter].append([el])
                else {
                    this.selection[this.selectionCounter] = new Array();
                    this.selection[this.selectionCounter][0] = el;
                }
                if (this.selection[this.selectionCounter].length > 1 && this.multiSelect) 
                    this.multiSelectActive = true;
            }
        }
    },
    clearSelection: function(){
        this.tbody.getElements('td').each(function(el){
            el.removeClass('table-td-selected');
            el.setProperty('aria-selected', 'false');
        });
        this.thead.getElements('th').each(function(el){
            el.removeClass('table-td-selected');
            el.setProperty('aria-selected', 'false');
        });
        if (!this.multiSelect) {
            this.selectionCounter = 0;
            this.selection.empty();
        }
        else {
            if (!this.shift) {
                if (this.multiSelectActive) {
                    this.multiSelectActive = false;
                    this.multiSelect = false;
                    this.selectionCounter = 0;
                    this.selection.empty();
                }
                else 
                    if (this.selection[this.selectionCounter]) {
                        this.selection[this.selectionCounter].empty();
                    }
            }
            this.selection.each(function(el){
                el.each(function(el){
                    el.addClass('table-td-selected');
                });
            });
        }
    },
    enter: function(e, obj){
        if (obj == 'th') {
            this.headClick(e, e.target);
        }
        else {
            if (this.interactiveMode) {
                this.interactiveMode = false;
                var currentTd = document.activeElement.getParent('td');
                if (!currentTd) 
                    var currentTd = document.activeElement;
                var currentTdValue = currentTd.getFirst('input').value;
                currentTd.set('html', '')
                currentTd.set('text', currentTdValue)
                this.setFocus(currentTd);
                this.setSelection(currentTd);
            }
            else {
                this.interactiveMode = true;
                this.clearSelection();
                var currentTd = document.activeElement;
                var currentTdValue = currentTd.get('text');
                var textfield = new Element('input', {
                    'type': 'text',
                    'value': currentTdValue
                })
                currentTd.set('html', '')
                textfield.inject(currentTd);
                textfield.focus();
            }
        }
    },
    f2: function(){
        if (!this.interactiveMode) {
            this.interactiveMode = true;
            this.clearSelection();
            var currentTd = document.activeElement;
            var currentTdValue = currentTd.get('text');
            var textfield = new Element('input', {
                'type': 'text',
                'value': currentTdValue
            })
            currentTd.set('html', '')
            textfield.inject(currentTd);
            setTimeout(function(){
                textfield.focus();
            }, 10);
        }
    },
    esc: function(){
        if (this.interactiveMode) {
            this.interactiveMode = false;
            var currentTd = document.activeElement.getParent('td');
            var currentTdValue = currentTd.getFirst('input').value;
            currentTd.set('html', '')
            currentTd.set('text', currentTdValue)
            this.setFocus(currentTd);
            this.setSelection(currentTd);
        }
    },
    checkInput: function(){
        if (this.interactiveMode && document.activeElement.get('tag') != 'input') {
            this.element.getElement('input').getParent
            this.interactiveMode = false;
            
            var currentTd = this.tbody.getElement('input').getParent('td');
            var currentTdValue = currentTd.getFirst('input').value;
            currentTd.set('html', '')
            currentTd.set('text', currentTdValue)
        }
    }
    
});
