console.log 'Trying to bootstrap the magic wand!'

loadScript = (src, id, cb) ->
  console.log "Loading #{id} from #{src}."
  s = document.body.appendChild document.createElement('script')
  s.language = 'javascript'
  s.type = 'text/javascript'
  s.src = src
  s.id = 'magic-wand-script-' + id
  s.onload = ->
    console.log "#{id} loaded successfully."
    cb?()

loadScript 'http://localhost:9000/jquery', 'jq', ->
  loadScript 'http://localhost:9000/magic', 'magic', ->
    loadScript 'http://localhost:9000/wand', 'wand', ->
      console.info 'Your wand should now be ready.'
