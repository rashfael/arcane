/*
    TODO:
        * Cascading Mappings
*/

// this is the configuraion file in JSON format
var configuration = {
    
    mappings: { // mappings used for scraping with magic
        baseMapping: {
            validFor: ['base'], // list of navigation elements for which this
                                // mapping will be used
            map:{
                'price': 'Price',
                'desc': 'Description',
            },
        },
    },
    
    navigation: { // navigation structure
        
        /* base
         * Every navigation structure definition must contain a base element.
         * This is the entry point of the scraping process.
         */
        base: {
            name: 'entry point',    // name is optional, it can be displayed in the UI
            action: 'start',        // start denotes that this element is the base
            type: 'resource',      // a type of the valid NavigationElement classes
            config: {               // this is the configuration for the NavigationElement
                                    // see each element for its special needs
                url: 'http://localhost:8000/',
            },
            next: ['forEachCategory'],  // a list of elements which will be called
                                        // with the output of this navigation element
        },

        /* custom navigation element
         * note that the name (forEachCategory) has no meaning.
         * It is just used to reference next elements.
         */
        forEachCategory: {
            action: 'forEach',      // forEach will call the 'next' element
                                    // for each of its output elements
            type: 'WalkthroughMenu',
            config: {
                selector: '#catChooser a',          // if selector is given, this
                                                    // selector must select ALL elements
                                                    // used for this navigation element
                itemSelector: '#catChooser a:first',// itemSelector expects only ONE
                                                    // element
            },
            next: ['forEachPager'],
        },
    
        forEachPager: {             // we cannot handle complex pagers right now
                                    // so we use linkList for simple pagers
                                    // which show all pages at once
            action: 'forEach',
            type: 'linkListNavigation',
            config: {
                selector: '#pager a',
            },
            next: ['forEachListItem'],
        },
    
        forEachListItem: {
            action: 'forEach',
            type: 'listDetailsNavigation',  // list of links but each item has
                                            // a link to its detail page
            config: {
                selector: 'ul.products li a',
                detailLink: 'a', // relative to parent itemSelector
            },
            next: ['detailPage'],
        },
    
        detailPage: {
            action: 'scrape',
            type: 'resource',
			config: {
				selector: 'body',
			},
        },
    },
};

module.exports = configuration
