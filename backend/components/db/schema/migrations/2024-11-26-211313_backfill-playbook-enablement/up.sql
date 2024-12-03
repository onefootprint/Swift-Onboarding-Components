UPDATE playbook pb
SET status = obc.status
FROM ob_configuration obc
WHERE obc.playbook_id = pb.id
AND pb.status != obc.status;
