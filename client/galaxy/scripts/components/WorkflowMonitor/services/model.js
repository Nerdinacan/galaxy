/**
 * The dumbest possible model class
 * @param {object} props Raw json properties
 */
export function WorkflowInvocation(props = {}) {
    Object.assign(this, props);
}

WorkflowInvocation.prototype.isComplete = function () {
    return this.status == "complete";
}

/**
 * Creates a new Workflow Invocation
 * @param {object} props Raw json props
 */
export const hydrate = props => new WorkflowInvocation(props)
