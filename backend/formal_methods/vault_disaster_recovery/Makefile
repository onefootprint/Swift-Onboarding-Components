# Download from https://github.com/tlaplus/tlaplus/releases
TLA2TOOLS := /usr/local/lib/tla2tools.jar
SPEC := vdr.tla

.PHONY: check
check: translate
	# The VSCode TLA+ extension gives better interactive output for failures.
	java \
		-XX:+UseParallelGC \
		-Xmx15G \
		-cp ${TLA2TOOLS} \
		tlc2.TLC \
		${SPEC} \
		-modelcheck \
		-workers auto

.PHONY: translate
translate:
	java -cp ${TLA2TOOLS} pcal.trans -nocfg ${SPEC}

