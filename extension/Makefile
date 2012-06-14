EXTNAME=wedex-extension.xpi
TARGETDIR=./xpi

xpi:
	mkdir -p $(TARGETDIR)
	rm -f $(TARGETDIR)/$(EXTNAME)
	zip -x \*.xpi -r $(TARGETDIR)/$(EXTNAME) *

clean:
	rm -r $(TARGETDIR)

