# Security Groups
This doc describes our security groups and best practices for adding new resources.

![Infra  Security Groups](https://user-images.githubusercontent.com/356333/203840615-106f926c-df6c-4bee-8915-388941b33e51.png)


## Best practices

Each resource has its own security group. Access to resources are defined in terms of INGRESS rules only.
That is, each resource describes what has access to it in terms of its ingress rules.

Each resource defines a single "open internet all" or "open vpc all" rule, except when a machine needs to be locked down further.