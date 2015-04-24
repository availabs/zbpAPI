GENERATED_FILES = \
	raw/zbp94detail.txt

all: $(GENERATED_FILES)

.PHONY: all clean

clean:
	rm -rf -- $(GENERATED_FILES) build

zips/%.zip:
	mkdir -p $(dir $@)
	curl -o $@ 'ftp://ftp.census.gov/Econ2001_And_Earlier/CBP_CSV/$(notdir $@)'
	unzip $(basename $@)
	

raw/zbp94detail.txt: zips/zbp94detail.zip
	mkdir -p $(dir $@)
	mv $(basename) $(dir)

