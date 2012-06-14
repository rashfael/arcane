/* sample configuration for dynamic_demo
 * how to look at dymanic_demo: $ npm install && node app # in this folder
 *
 *
 *        /-------------\
 *        |             |      /--REQ--\
 *  -IN-->|    NODE     |-OUT-<---HTML-->---> Next Node
 *        |             |      \--DATA-/
 *        \-------------/
 *
 * OUT.REQ:    request objects
 * OUT.HTML:   html fragments
 * OUT.DATA:   key:value-pairs
 * 
 * IN: same three as OUT
 *
 * There are three basic types of nodes:
 * - WalkthroughX  -o= (Links, Items, …) # one in, many out
 * - FollowX       -o- (Link)            # one in, one out
 * - Collect       -o|                   # one in, dump, stop.
 *
 * If this all makes NO SENSE, then PLEASE CORRECT IT. Thanks.
 *
 */
module.exports = {
    mappings: {
        base: {
            validFor: ['base'], // list of nodes for which this mapping should be used
            map: {
                'sampleKey': 'sampleValue',
                'keyToIgnore': null, // this key-value pair will not be saved to the db
            }
        }
    },
    
    navigation: {
        base: {
            type: 'Start',
            config: {
                request: {
                    url: 'http://localhost:3000/',
                },
            },
            next: ['nodeCategories'],
        },
        
        nodeCategories: {
            type: 'WalkthroughLinks', // this type has HTTP-request output!
            config: {
                // One of those selectors is required!
                areaSelector: '#mainCategories', // areaSelector expects a div, all links in it will be used
                // selector: '#ul li a' // selector selects all menu hyperlinks that shall be visited
            },
            next: ['nodeCategoryOverview'],
        },
        
        nodeCategoryOverview: {
            type: 'WalkthroughItems', // outputs html fragments
            config: {
                itemSelector: 'ul.items li:first',
                // selector: 'ul.items li',
            },
            next: ['nodeItemFollowDetails'],
        },
        
        nodeItemFollowDetails: {
            type: 'FollowLink', // follow a specific link in the previous page/html
            config: {
                linkSelector: 'a.details', // selector RELATIVE to the previous item
            },
            next: ['nodeItemCollect'],
        },
        
        nodeItemCollect: {
            type: 'Collect',
            config: {
                itemSelector: 'body', // try to get everything in the body
            },
        },
    },
}