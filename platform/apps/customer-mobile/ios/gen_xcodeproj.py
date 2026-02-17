#!/usr/bin/env python3
"""Generate a minimal but valid Xcode project for BerhotCafe SwiftUI app."""
import os, uuid, hashlib

def uid(name):
    """Deterministic 24-char hex ID from name."""
    return hashlib.md5(name.encode()).hexdigest()[:24].upper()

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_DIR, "BerhotCafe")

# Collect swift files
swift_files = []
for root, dirs, files in os.walk(SRC_DIR):
    for f in files:
        if f.endswith(".swift"):
            rel = os.path.relpath(os.path.join(root, f), SRC_DIR)
            swift_files.append(rel)
swift_files.sort()

# IDs
proj_id = uid("project")
main_group_id = uid("mainGroup")
src_group_id = uid("srcGroup")
target_id = uid("target")
build_phase_sources_id = uid("buildPhaseSources")
build_phase_frameworks_id = uid("buildPhaseFrameworks")
build_phase_resources_id = uid("buildPhaseResources")
product_ref_id = uid("productRef")
products_group_id = uid("productsGroup")
assets_ref_id = uid("assetsXcassets")
assets_build_id = uid("assetsBuildFile")
debug_id = uid("debug")
release_id = uid("release")
target_debug_id = uid("targetDebug")
target_release_id = uid("targetRelease")
proj_config_list_id = uid("projConfigList")
target_config_list_id = uid("targetConfigList")

# Build file refs and source build files
file_refs = {}
build_files = {}
group_children = {}

for sf in swift_files:
    fid = uid(f"fileRef_{sf}")
    bid = uid(f"buildFile_{sf}")
    file_refs[sf] = fid
    build_files[sf] = bid

    # Collect into groups by directory
    parts = sf.split("/")
    if len(parts) == 1:
        group_children.setdefault("__root__", []).append(sf)
    else:
        group_children.setdefault(parts[0], []).append(sf)

# Group IDs
group_ids = {}
for g in group_children:
    group_ids[g] = uid(f"group_{g}")

# Sub-groups within top-level groups
sub_groups = {}
for sf in swift_files:
    parts = sf.split("/")
    if len(parts) >= 3:
        top = parts[0]
        sub = parts[1]
        key = f"{top}/{sub}"
        sub_groups.setdefault(key, []).append(sf)

sub_group_ids = {}
for sg in sub_groups:
    sub_group_ids[sg] = uid(f"subgroup_{sg}")

lines = []
def w(s=""):
    lines.append(s)

w("// !$*UTF8*$!")
w("{")
w("\tarchiveVersion = 1;")
w("\tclasses = {")
w("\t};")
w("\tobjectVersion = 56;")
w("\tobjects = {")
w("")

# PBXBuildFile
w("/* Begin PBXBuildFile section */")
for sf in swift_files:
    fname = os.path.basename(sf)
    w(f"\t\t{build_files[sf]} /* {fname} in Sources */ = {{isa = PBXBuildFile; fileRef = {file_refs[sf]} /* {fname} */; }};")
w(f"\t\t{assets_build_id} /* Assets.xcassets in Resources */ = {{isa = PBXBuildFile; fileRef = {assets_ref_id} /* Assets.xcassets */; }};")
w("/* End PBXBuildFile section */")
w("")

# PBXFileReference
w("/* Begin PBXFileReference section */")
for sf in swift_files:
    fname = os.path.basename(sf)
    w(f'\t\t{file_refs[sf]} /* {fname} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{fname}"; sourceTree = "<group>"; }};')
w(f'\t\t{product_ref_id} /* BerhotCafe.app */ = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "BerhotCafe.app"; sourceTree = BUILT_PRODUCTS_DIR; }};')
w(f'\t\t{assets_ref_id} /* Assets.xcassets */ = {{isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = "Assets.xcassets"; sourceTree = "<group>"; }};')
w("/* End PBXFileReference section */")
w("")

# PBXFrameworksBuildPhase
w("/* Begin PBXFrameworksBuildPhase section */")
w(f"\t\t{build_phase_frameworks_id} /* Frameworks */ = {{")
w("\t\t\tisa = PBXFrameworksBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")
w("/* End PBXFrameworksBuildPhase section */")
w("")

# PBXGroup
w("/* Begin PBXGroup section */")

# Main group
w(f"\t\t{main_group_id} = {{")
w("\t\t\tisa = PBXGroup;")
w("\t\t\tchildren = (")
w(f"\t\t\t\t{src_group_id} /* BerhotCafe */,")
w(f"\t\t\t\t{products_group_id} /* Products */,")
w("\t\t\t);")
w('\t\t\tsourceTree = "<group>";')
w("\t\t};")

# Products group
w(f"\t\t{products_group_id} /* Products */ = {{")
w("\t\t\tisa = PBXGroup;")
w("\t\t\tchildren = (")
w(f"\t\t\t\t{product_ref_id} /* BerhotCafe.app */,")
w("\t\t\t);")
w('\t\t\tname = Products;')
w('\t\t\tsourceTree = "<group>";')
w("\t\t};")

# Source group (BerhotCafe)
w(f"\t\t{src_group_id} /* BerhotCafe */ = {{")
w("\t\t\tisa = PBXGroup;")
w("\t\t\tchildren = (")
# Asset catalog
w(f"\t\t\t\t{assets_ref_id} /* Assets.xcassets */,")
# Root files
for sf in group_children.get("__root__", []):
    fname = os.path.basename(sf)
    w(f"\t\t\t\t{file_refs[sf]} /* {fname} */,")
# Top-level groups
for g in sorted(group_children.keys()):
    if g == "__root__":
        continue
    w(f"\t\t\t\t{group_ids[g]} /* {g} */,")
w("\t\t\t);")
w('\t\t\tpath = BerhotCafe;')
w('\t\t\tsourceTree = "<group>";')
w("\t\t};")

# Top-level sub-directories
for g in sorted(group_children.keys()):
    if g == "__root__":
        continue
    w(f"\t\t{group_ids[g]} /* {g} */ = {{")
    w("\t\t\tisa = PBXGroup;")
    w("\t\t\tchildren = (")

    # Check for sub-groups
    seen_subgroups = set()
    for sf in group_children[g]:
        parts = sf.split("/")
        if len(parts) >= 3:
            sg_key = f"{parts[0]}/{parts[1]}"
            if sg_key not in seen_subgroups:
                seen_subgroups.add(sg_key)
                w(f"\t\t\t\t{sub_group_ids[sg_key]} /* {parts[1]} */,")
        elif len(parts) == 2:
            fname = os.path.basename(sf)
            w(f"\t\t\t\t{file_refs[sf]} /* {fname} */,")

    w("\t\t\t);")
    w(f'\t\t\tpath = "{g}";')
    w('\t\t\tsourceTree = "<group>";')
    w("\t\t};")

# Sub-sub-directories (e.g., Views/Auth, Views/Cart)
for sg_key in sorted(sub_group_ids.keys()):
    sg_name = sg_key.split("/")[1]
    w(f"\t\t{sub_group_ids[sg_key]} /* {sg_name} */ = {{")
    w("\t\t\tisa = PBXGroup;")
    w("\t\t\tchildren = (")
    for sf in sub_groups[sg_key]:
        fname = os.path.basename(sf)
        w(f"\t\t\t\t{file_refs[sf]} /* {fname} */,")
    w("\t\t\t);")
    w(f'\t\t\tpath = "{sg_name}";')
    w('\t\t\tsourceTree = "<group>";')
    w("\t\t};")

w("/* End PBXGroup section */")
w("")

# PBXNativeTarget
w("/* Begin PBXNativeTarget section */")
w(f"\t\t{target_id} /* BerhotCafe */ = {{")
w("\t\t\tisa = PBXNativeTarget;")
w(f"\t\t\tbuildConfigurationList = {target_config_list_id} /* Build configuration list for PBXNativeTarget */;")
w('\t\t\tbuildPhases = (')
w(f"\t\t\t\t{build_phase_sources_id} /* Sources */,")
w(f"\t\t\t\t{build_phase_frameworks_id} /* Frameworks */,")
w(f"\t\t\t\t{build_phase_resources_id} /* Resources */,")
w("\t\t\t);")
w("\t\t\tbuildRules = (")
w("\t\t\t);")
w("\t\t\tdependencies = (")
w("\t\t\t);")
w('\t\t\tname = BerhotCafe;')
w(f"\t\t\tproductName = BerhotCafe;")
w(f"\t\t\tproductReference = {product_ref_id} /* BerhotCafe.app */;")
w('\t\t\tproductType = "com.apple.product-type.application";')
w("\t\t};")
w("/* End PBXNativeTarget section */")
w("")

# PBXProject
w("/* Begin PBXProject section */")
w(f"\t\t{proj_id} /* Project object */ = {{")
w("\t\t\tisa = PBXProject;")
w("\t\t\tattributes = {")
w("\t\t\t\tBuildIndependentTargetsInParallel = 1;")
w("\t\t\t\tLastSwiftUpdateCheck = 1620;")
w("\t\t\t\tLastUpgradeCheck = 1620;")
w("\t\t\t};")
w(f"\t\t\tbuildConfigurationList = {proj_config_list_id} /* Build configuration list for PBXProject */;")
w('\t\t\tcompatibilityVersion = "Xcode 14.0";')
w("\t\t\tdevelopmentRegion = en;")
w("\t\t\thasScannedForEncodings = 0;")
w("\t\t\tknownRegions = (")
w("\t\t\t\ten,")
w("\t\t\t\tar,")
w("\t\t\t);")
w(f"\t\t\tmainGroup = {main_group_id};")
w(f"\t\t\tproductRefGroup = {products_group_id} /* Products */;")
w('\t\t\tprojectDirPath = "";')
w('\t\t\tprojectRoot = "";')
w("\t\t\ttargets = (")
w(f"\t\t\t\t{target_id} /* BerhotCafe */,")
w("\t\t\t);")
w("\t\t};")
w("/* End PBXProject section */")
w("")

# PBXResourcesBuildPhase
w("/* Begin PBXResourcesBuildPhase section */")
w(f"\t\t{build_phase_resources_id} /* Resources */ = {{")
w("\t\t\tisa = PBXResourcesBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
w(f"\t\t\t\t{assets_build_id} /* Assets.xcassets in Resources */,")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")
w("/* End PBXResourcesBuildPhase section */")
w("")

# PBXSourcesBuildPhase
w("/* Begin PBXSourcesBuildPhase section */")
w(f"\t\t{build_phase_sources_id} /* Sources */ = {{")
w("\t\t\tisa = PBXSourcesBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
for sf in swift_files:
    fname = os.path.basename(sf)
    w(f"\t\t\t\t{build_files[sf]} /* {fname} in Sources */,")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")
w("/* End PBXSourcesBuildPhase section */")
w("")

# Build settings
common_settings = '''
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				COPY_PHASE_STRIP = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_NO_COMMON_BLOCKS = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 16.0;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = "$(inherited)";
				SWIFT_VERSION = 5.0;'''

target_common = '''
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_KEY_CFBundleDisplayName = "Berhot Cafe";
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_NSLocationWhenInUseUsageDescription = "We need your location to find cafes and shops near you";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.berhot.cafe;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				TARGETED_DEVICE_FAMILY = "1,2";'''

w("/* Begin XCBuildConfiguration section */")
# Project Debug
w(f"\t\t{debug_id} /* Debug */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w(common_settings)
w('\t\t\t\tDEBUG_INFORMATION_FORMAT = dwarf;')
w('\t\t\t\tENABLE_TESTABILITY = YES;')
w('\t\t\t\tGCC_OPTIMIZATION_LEVEL = 0;')
w('\t\t\t\tONLY_ACTIVE_ARCH = YES;')
w('\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = "-Onone";')
w("\t\t\t};")
w("\t\t\tname = Debug;")
w("\t\t};")

# Project Release
w(f"\t\t{release_id} /* Release */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w(common_settings)
w('\t\t\t\tCOPY_PHASE_STRIP = YES;')
w('\t\t\t\tDEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";')
w('\t\t\t\tENABLE_NS_ASSERTIONS = NO;')
w('\t\t\t\tSWIFT_COMPILATION_MODE = wholemodule;')
w('\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = "-O";')
w('\t\t\t\tVALIDATE_PRODUCT = YES;')
w("\t\t\t};")
w("\t\t\tname = Release;")
w("\t\t};")

# Target Debug
w(f"\t\t{target_debug_id} /* Debug */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w(target_common)
w('\t\t\t\tSWIFT_ACTIVE_COMPILATION_CONDITIONS = "DEBUG $(inherited)";')
w("\t\t\t};")
w("\t\t\tname = Debug;")
w("\t\t};")

# Target Release
w(f"\t\t{target_release_id} /* Release */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w(target_common)
w("\t\t\t};")
w("\t\t\tname = Release;")
w("\t\t};")

w("/* End XCBuildConfiguration section */")
w("")

# XCConfigurationList
w("/* Begin XCConfigurationList section */")
w(f"\t\t{proj_config_list_id} /* Build configuration list for PBXProject */ = {{")
w("\t\t\tisa = XCConfigurationList;")
w("\t\t\tbuildConfigurations = (")
w(f"\t\t\t\t{debug_id} /* Debug */,")
w(f"\t\t\t\t{release_id} /* Release */,")
w("\t\t\t);")
w("\t\t\tdefaultConfigurationIsVisible = 0;")
w("\t\t\tdefaultConfigurationName = Release;")
w("\t\t};")
w(f"\t\t{target_config_list_id} /* Build configuration list for PBXNativeTarget */ = {{")
w("\t\t\tisa = XCConfigurationList;")
w("\t\t\tbuildConfigurations = (")
w(f"\t\t\t\t{target_debug_id} /* Debug */,")
w(f"\t\t\t\t{target_release_id} /* Release */,")
w("\t\t\t);")
w("\t\t\tdefaultConfigurationIsVisible = 0;")
w("\t\t\tdefaultConfigurationName = Release;")
w("\t\t};")
w("/* End XCConfigurationList section */")
w("")

w("\t};")
w(f"\trootObject = {proj_id} /* Project object */;")
w("}")

output_path = os.path.join(PROJECT_DIR, "BerhotCafe.xcodeproj", "project.pbxproj")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"Generated project with {len(swift_files)} source files")
print(f"Written to: {output_path}")
