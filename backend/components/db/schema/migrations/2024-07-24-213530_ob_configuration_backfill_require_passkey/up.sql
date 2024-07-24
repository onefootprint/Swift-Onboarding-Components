UPDATE ob_configuration
SET prompt_for_passkey = 'f'
WHERE
    prompt_for_passkey = 't' AND
    (
        -- Doesn't really matter, but otherwise a little misleading
        kind = 'auth' OR
        -- Hard to register passkey with no phone
        is_no_phone_flow OR
        -- Flexcar's playbook that currently has passkeys disabled. I'm not sure why we have this still, maybe
        -- we should re-enable for them
        key = 'ob_live_mgbAfhOP2TV43TmOkC6cBy' OR
        -- Basic capital.
        -- Right now, basic capital is still allowing desktop passkey registration? Not sure if that's intentional
        tenant_id = 'org_hfT6m85IKbPHDFVOcybEmF'
    );