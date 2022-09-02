using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Parlance;
using Parlance.Authorization.LanguageEditor;
using Parlance.Authorization.Superuser;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Project;
using Parlance.Services.Permissions;
using Parlance.Services.Projects;
using Parlance.Services.RemoteCommunication;
using Parlance.Services.Superuser;
using Parlance.VersionControl;
using Parlance.VersionControl.Services;
using Parlance.Vicr123Accounts;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSwaggerGen();
builder.Services.AddVicr123Accounts(builder.Configuration);
builder.Services.AddVersionControl(builder.Configuration);
builder.Services.AddParlanceProjects(builder.Configuration);
await builder.Services.AddCldrAsync(builder.Configuration);

builder.Services.AddSingleton<IVersionControlService, VersionControlService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ISuperuserService, SuperuserService>();
builder.Services.AddScoped<IRemoteCommunicationService, RemoteCommunicationService>();
builder.Services.AddScoped<IPermissionsService, PermissionsService>();

builder.Services.Configure<ParlanceOptions>(builder.Configuration.GetSection("Parlance"));

builder.Services.AddDbContext<ParlanceContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetSection("Parlance")["DatabaseConnectionString"], optionsBuilder =>
    {
        optionsBuilder.EnableRetryOnFailure();
    });
});

builder.Services.AddScoped<IAuthorizationHandler, LanguageEditorHandler>();
builder.Services.AddScoped<IAuthorizationHandler, SuperuserHandler>();

builder.Services.AddAuthorizationCore(options =>
{
    options.AddPolicy("LanguageEditor", policy => policy.Requirements.Add(new LanguageEditorRequirement()));
    options.AddPolicy("Superuser", policy => policy.Requirements.Add(new SuperuserRequirement()));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    "default",
    "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await services.GetRequiredService<ParlanceContext>().Initialize();
}

app.Run();