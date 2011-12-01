document.addEvent('domready', function(){
	var container = $('tabl');
    var grid = new AccessibleGrid({
        properties: {
            border: 1,
            cellspacing: 3
        },
		gridContainer : container,
		gridname:'Bodydata',
        headers: ['Name', 'Firstname', 'Sex', 'Height (cm)', 'Weight (kg)'],
        rows: [['Porter', 'Oliver', 'male', '172', '87'], ['Cooper', 'Jack', 'male', '145', '56'], ['Brown', 'Ruby', 'female', '189', '110'], ['Bush', 'Alfie', 'male', '175', '75'], ['Fletcher', 'Jessica', 'female', '112', '45']],

        zebra: true
    });
    grid.inject(container);
    grid.enableSort();
});
