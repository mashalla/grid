Accessible Grid
===========

This widget provides an easy to use and accessible grid for data organization with screen reader support.	
Widget based on HtmlTable of the Mootools More Package! 

![Screenshot](http://www.accessiblemootoolsdemo.iao.fraunhofer.de/Mootools_Widgets/img/Grid.png)

How to use
----------

Similar to Mootools HtmlTable. Create a new grid by using the following command:

	#HTML
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
	
### Parameters ###
* properties: specify useful html properties
* gridContainer: the containing DOM element of this grid
* headers: the column headers of the grid
* rows: content of the cells in the rows
* zebra: if neighbour grid rows should be coloured differently for enhanced visibility

To integrate the grid into your site define a container

	#HTML
	var container = $('tabl');	
	
and then add the grid to this container

	#HTML
	grid.inject(container);

Sorting is also possbile.

	#HTML
	grid.enableSort();
	

	

