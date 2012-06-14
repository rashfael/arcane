@coffee -c cluster\lib & coffee -c cluster\config.coffee & coffee -c commons & mkdir ..\lib & coffee -o ..\lib -c ..\magic\src\lib & coffee -o .. -c ..\magic\src & node cluster\lib\cluster.js
