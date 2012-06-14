# module for the transformation of other encodings to the used utf8 encoding

iconv = require 'iconv-lite'

encodingMap = {
	'utf8': 'utf8',
	'utf-8': 'utf8',

	'latin1': 'latin1',
	'latin-1': 'latin1',
	'iso-8859-1': 'latin1',
	'iso8859-1': 'latin1',
	'iso-88591': 'latin1',
	'iso88591': 'latin1',

	'latin9': 'latin1',
	'latin-9': 'latin1',
	'iso-8859-15': 'latin1',
	'iso8859-15': 'latin1',
	'iso-885915': 'latin1',
	'iso885915': 'latin1',

	'windows1252': 'windows1252',
	'windows-1252': 'windows1252',
	'win1252': 'windows1252',
	'win-1252': 'windows1252',
	'cp1252': 'windows1252',
	'cp-1252': 'windows1252',
	'1252': 'windows1252'
}

#### toUtf8
# Convertion to utf8 encoding
#
# Parameters:
#
# * **test**: text which should be encoded with utf8
# * **encoding**: current encoding of the given text
module.exports.toUtf8 = (text, encoding) ->
	if encoding? and text?
		encoding = encodingMap[encoding.toLowerCase()]
		if encoding?
			str = iconv.fromEncoding(new Buffer(text, 'binary'), encoding)
			text = iconv.toEncoding(str, 'utf8').toString()
	return text
