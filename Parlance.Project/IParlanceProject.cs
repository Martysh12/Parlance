namespace Parlance.Project;


public interface IParlanceProject
{
    public string Name { get; }
    public string VcsDirectory { get; }
    public IReadOnlyList<IParlanceSubproject> Subprojects { get; }
    public IParlanceSubproject SubprojectBySystemName(string systemName);
}