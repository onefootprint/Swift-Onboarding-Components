TLAPLUS_VERSION := v1.7.4
TLA2TOOLS := ${PWD}/tla2tools-${TLAPLUS_VERSION}.jar
SPEC := vdr.tla

.PHONY: check
check: ${TLA2TOOLS} translate
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
translate: ${TLA2TOOLS}
	java -cp ${TLA2TOOLS} pcal.trans -nocfg ${SPEC}

${TLA2TOOLS}:
	wget -O $@ https://github.com/tlaplus/tlaplus/releases/download/${TLAPLUS_VERSION}/tla2tools.jar
