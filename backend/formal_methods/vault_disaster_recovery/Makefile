TLAPLUS_VERSION := v1.7.4
TLA2TOOLS := ${PWD}/tla2tools-${TLAPLUS_VERSION}.jar
SPEC := vdr.tla

.PHONY: check_all
check_all: check_small_fairspec check_medium_fairspec check_large_terminatesspec

# Takes about 1 minute. checks for termination.
.PHONY: check_small_fairspec
check_small_fairspec: CFG=vdr_small_fairspec.cfg
check_small_fairspec: check

# Takes about 30 minutes, checks for termination.
.PHONY: check_medium_fairspec
check_medium_fairspec: CFG=vdr_medium_fairspec.cfg
check_medium_fairspec: check

# Takes about 2 hours. Only checks executions that terminate, but can explore a larger state space.
.PHONY: check_large_terminatesspec
check_large_terminatesspec: CFG=vdr_large_terminatesspec.cfg
check_large_terminatesspec: check

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
		-config ${CFG} \
		-workers auto

.PHONY: translate
translate: ${TLA2TOOLS}
	java -cp ${TLA2TOOLS} pcal.trans -nocfg ${SPEC}

${TLA2TOOLS}:
	wget -O $@ https://github.com/tlaplus/tlaplus/releases/download/${TLAPLUS_VERSION}/tla2tools.jar
