magicLib = require('./magic')
magic = new magicLib(window)

startWaving = ->

  console.log 'You may now wave the wand around. With your mouse.'

  magicScroll = jQuery(
                '''
                <div>
                  <h2>Magic</h2>
                  <div class='infos'></div>
                  <div class='found'></div>
                </div>
                ''')
                .attr('id','magic-scroll')
                .css('type','text')
                .css('width','256px')
                .css('padding','2px')
                .css('border','4px solid black')
                .css('borderRadius', '8px')
                .css('background', '#000')
                .css('color', '#fff')
                .css('fontSize', '13px')
                .css('position', 'fixed')
                .css('top', '3px')
                .css('right', '3px')
                .css('z-index', '99999')
  
  jQuery('body').append(magicScroll)
  
  lastInspected = undefined
  
  inspect = (e) ->
  
    element = document.elementFromPoint(e.x, e.y)

    return if element is lastInspected
    lastInspected = element
    
    infos = []
    infos[0] = element.tagName
    infos[1] = '#' + element.id if element.id
    infos[2] = '.' + element.className.replace /\ /g, '.' if element.className
   
    jQuery(magicScroll)
      .find('div.infos')
      .html('<b>Element: ' + infos.join('') + '</b>')
  
    list = jQuery('<ul></ul>')
    attributes = magic.attributes.findAttributes element, {}
    jQuery.each attributes, (found) ->
      list.append("<li>#{this.key} : #{this.value}</li>")
  
    jQuery(magicScroll)
      .find('div.found')
      .html(list)
  
  window.addEventListener 'mousemove', inspect, true

startWaving()